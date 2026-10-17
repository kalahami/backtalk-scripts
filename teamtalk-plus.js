export const manifest = {
  id: 'kalahami.teamtalk-plus',
  name: 'TeamTalk Plus helper',
  version: '1',
  author: 'kalahami',
  homepage: 'https://github.com/kalahami/backtalk-scripts/blob/main/teamtalk-plus.js',
  minApiVersion: 1,
  testedApiVersion: 3,
  description:
    'In TeamTalk Plus, reads the latest chat message, mutes the speaker and changes its volume ' +
    'from the Backtalk menu and reading controls. Everywhere, makes its notifications quieter.',
  // No apps, so that it hears TeamTalk Plus notifications while another app is in front. Its
  // commands are only offered while TeamTalk Plus is.
  // screen: which app is in front, and reading the chat. actions: pressing mute, moving the volume.
  // speech: speaking and changing notifications. input: the commands. notifications: onNotification.
  permissions: ['screen', 'actions', 'speech', 'input', 'notifications'],
  settings: [
    {
      key: 'privateMessages',
      type: 'list',
      title: 'Private message notifications',
      options: [
        { value: 'short', label: 'Say only who it is from' },
        { value: 'full', label: 'Say the whole notification' },
        { value: 'silent', label: 'Say nothing' },
      ],
      default: 'short',
    },
    {
      key: 'otherNotifications',
      type: 'switch',
      title: 'Read other TeamTalk Plus notifications',
      summary: 'Such as the server and channel you are in, and file transfers',
      default: true,
    },
    {
      key: 'sayTime',
      type: 'switch',
      title: 'Say the time of the latest message',
      default: true,
    },
  ],
  commands: [
    { id: 'latest', title: 'Read latest TeamTalk message', menu: true },
    { id: 'mute', title: 'Mute or unmute TeamTalk speaker', menu: true },
    { id: 'volume', title: 'TeamTalk speaker volume', control: true },
  ],
};

const PACKAGE = 'com.teamtalk.plus';
// How long the app takes to update its labels after a button is pressed or the volume moves.
const SETTLE_MS = 200;
// The app's English private message notification, as "New message from user Bob".
const PRIVATE_MESSAGE = /^New message from user (.*)$/;
const PRIVATE_MESSAGE_HINT = 'Click to read and answer';

let settings = backtalk.settings.all();
let commands = [];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function say(text) {
  backtalk.speak(text, { interrupt: true });
}

/** Finds an item on TeamTalk Plus's main screen, or says to go there. */
function mainScreenItem(id) {
  const item = backtalk.screen.find(id);
  if (!item) say("Go to TeamTalk Plus's main screen first");
  return item;
}

// Chat rows hold name_text, msg_text and time_text, oldest first, in channel, global and private
// chats alike. A tab the pager keeps off screen still has its rows, so rows on screen come first.
function readLatest() {
  const rows = backtalk.screen.findAll('item_textmsg', 200);
  const shown = rows.filter((row) => row.visible);
  const row = (shown.length > 0 ? shown : rows).at(-1);
  if (!row) {
    say('No chat messages on screen. Open a chat tab first');
    return;
  }
  const name = row.find('name_text')?.text;
  const message = row.find('msg_text')?.text;
  const time = settings.sayTime ? row.find('time_text')?.text : null;
  say([name, message, time].filter((part) => part).join(', ') || 'The message is empty');
}

async function toggleMute() {
  const button = mainScreenItem('speakerBtn');
  if (!button) return;
  if (!(await button.click())) {
    say('Could not press mute');
    return;
  }
  await wait(SETTLE_MS);
  // The button is labelled with what it does next, so "Unmute" means the speaker is muted.
  const label = button.refresh()?.contentDescription;
  if (label) say(label === 'Unmute' ? 'Speaker muted' : 'Speaker on');
}

async function changeVolume(louder) {
  const bar = mainScreenItem('master_volSeekBar');
  if (!bar) return;
  if (!bar.enabled) {
    say('The speaker is muted');
    return;
  }
  const moved = await (louder ? bar.scrollForward() : bar.scrollBackward());
  await wait(SETTLE_MS);
  const level = backtalk.screen.find('vollevel_text')?.text;
  if (!moved) {
    say(louder ? 'Volume is at most' : 'Volume is at least');
  } else if (level) {
    say(level);
  }
}

// Offers the commands only while TeamTalk Plus is in front, so they don't fill the Backtalk menu
// and reading controls of other apps.
function offerCommands() {
  if (commands.length > 0) return;
  commands = [
    backtalk.onCommand('latest', readLatest),
    backtalk.onCommand('mute', toggleMute),
    // Swiping up is louder, as on a slider.
    backtalk.onCommand('volume', (event) => changeVolume(event.direction === 'previous')),
  ];
}

function withdrawCommands() {
  commands.forEach((remove) => remove());
  commands = [];
}

backtalk.onAppEnter((app) => {
  if (app.package === PACKAGE) {
    offerCommands();
  } else {
    withdrawCommands();
  }
});

backtalk.onSettingChange((key, value) => {
  settings = { ...settings, [key]: value };
});

// Speech hooks have 30 milliseconds, so this only looks at what it's given.
backtalk.onNotification((info) => {
  if (info.package !== PACKAGE || info.toast) return undefined;
  const match = PRIVATE_MESSAGE.exec(info.title ?? '');
  if (match || info.text === PRIVATE_MESSAGE_HINT) {
    const from = match?.[1].trim();
    switch (settings.privateMessages) {
      case 'silent':
        return false;
      case 'short':
        return from ? `TeamTalk message from ${from}` : 'TeamTalk message';
      default:
        return undefined;
    }
  }
  return settings.otherNotifications ? undefined : false;
});

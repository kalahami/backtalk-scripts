export const manifest = {
  id: 'notification-filter',
  name: 'Notification filter',
  version: '1.0',
  author: 'kalahami',
  homepage: 'https://github.com/kalahami/backtalk-scripts/blob/main/notification-filter.js',
  minApiVersion: 1,
  testedApiVersion: 3,
  description:
    'Keeps Backtalk quiet for notifications from apps you mute, or that contain words you choose. ' +
    'Choose Mute or unmute notifications in the Backtalk menu to pick an app.',
  // notifications: onNotification. speech: silencing it. dialogs: the list of apps. input: the command.
  permissions: ['notifications', 'speech', 'dialogs', 'input'],
  settings: [
    {
      key: 'enabled',
      type: 'switch',
      title: 'Filter notifications',
      default: true,
    },
    {
      key: 'keywords',
      type: 'text',
      title: 'Mute notifications that contain',
      default: '',
    },
    {
      key: 'muteToasts',
      type: 'switch',
      title: 'Also mute short pop-up messages',
      summary: 'Toasts, such as "Message sent"',
      default: false,
    },
    {
      key: 'clear',
      type: 'button',
      title: 'Unmute all apps',
    },
  ],
  commands: [{ id: 'manage', title: 'Mute or unmute notifications', menu: true }],
};

// How many apps that recently posted notifications to offer for muting.
const RECENT_LIMIT = 10;

// Speech hooks have 30 milliseconds, so everything they read is kept here rather than asked for
// each time.
let muted = new Set(backtalk.storage.get('muted', []));
let recent = backtalk.storage.get('recent', []);
let settings = backtalk.settings.all();
let keywords = parseKeywords(settings.keywords);

function parseKeywords(text) {
  return String(text ?? '')
    .split(',')
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0);
}

function appName(packageName) {
  const last = String(packageName).split('.').pop();
  return last ? last[0].toUpperCase() + last.slice(1) : String(packageName);
}

function saveMuted() {
  backtalk.storage.set('muted', [...muted]);
}

// Remembers the app, outside the speech hook so the hook stays fast.
function remember(packageName) {
  if (!packageName || recent[0] === packageName) return;
  recent = [packageName, ...recent.filter((name) => name !== packageName)].slice(0, RECENT_LIMIT);
  backtalk.storage.set('recent', recent);
}

backtalk.onNotification((info) => {
  if (info.package) setTimeout(remember, 0, info.package);
  if (!settings.enabled) return undefined;
  if (info.toast) return settings.muteToasts ? false : undefined;
  if (muted.has(info.package)) return false;
  if (keywords.length > 0) {
    const words = `${info.title ?? ''} ${info.text ?? ''}`.toLowerCase();
    if (keywords.some((word) => words.includes(word))) return false;
  }
  return undefined;
});

backtalk.onSettingChange((key, value) => {
  settings = { ...settings, [key]: value };
  if (key === 'keywords') keywords = parseKeywords(value);
});

backtalk.onButton((key) => {
  if (key !== 'clear') return;
  muted = new Set();
  saveMuted();
  backtalk.speak('All apps unmuted');
});

backtalk.onCommand('manage', async () => {
  const apps = [...new Set([...recent, ...muted])];
  if (apps.length === 0) {
    await backtalk.ui.alert('No app has posted a notification since this script was installed.');
    return;
  }
  const options = apps.map((packageName) => ({
    value: packageName,
    label: muted.has(packageName)
      ? `Unmute ${appName(packageName)} (muted)`
      : `Mute ${appName(packageName)}`,
  }));
  const chosen = await backtalk.ui.choose('Mute or unmute notifications', options);
  if (chosen === null) return;
  if (muted.has(chosen)) {
    muted.delete(chosen);
    backtalk.speak(`${appName(chosen)} unmuted`);
  } else {
    muted.add(chosen);
    backtalk.speak(`${appName(chosen)} muted`);
  }
  saveMuted();
});

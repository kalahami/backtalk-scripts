# Backtalk scripts

Scripts for [Backtalk](https://github.com/trypsynth/backtalk), the screen reader for Android.

## Install

In Backtalk settings, go to **Advanced settings** > **Scripts** > **Script sources**, choose **Add source**, and enter:

```
github.com/kalahami/backtalk-scripts
```

Then choose a script from the list to install it.

## Scripts

### Notification filter

`notification-filter.js` keeps Backtalk quiet for notifications from apps you mute, or that contain words you choose.

*   To mute or unmute an app, open the Backtalk menu and choose **Mute or unmute notifications**. The list has the apps that posted notifications most recently.
*   To mute notifications by their words, set **Mute notifications that contain** in the script's settings, such as `sale, promo`.
*   The settings can also mute short pop-up messages, and unmute every app.

Muted notifications still appear in the notification shade. Backtalk just doesn't read them.

It asks for the `notifications`, `speech`, `dialogs` and `input` permissions.

### TeamTalk Plus helper

`teamtalk-plus.js` helps with [TeamTalk Plus](https://github.com/JoaoDEVWHADS/TeamTalkPlus).

While TeamTalk Plus is open, the Backtalk menu has:

*   **Read latest TeamTalk message**, which says who sent the newest message on screen, what it says, and when. Open a chat tab first.
*   **Mute or unmute TeamTalk speaker**.

The reading controls have **TeamTalk speaker volume**: swipe up for louder and down for quieter. Mute and volume work on TeamTalk Plus's main screen. You can also give each of these a gesture or keys on the script's page, under **Commands**.

In every app, it makes TeamTalk Plus notifications quieter. By default a private message is read as "TeamTalk message from Bob". In the script's settings, you can have private messages read in full or not at all, and turn off other TeamTalk Plus notifications, such as the server and channel you're in.

It recognizes private messages only when TeamTalk Plus is in English. It asks for the `screen`, `actions`, `speech`, `input` and `notifications` permissions.

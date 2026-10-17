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

# LG ScreenBoard — Limitations

These are **platform-level constraints imposed by LG webOS**, not bugs in the app.
No workaround exists within the webOS sandbox available to third-party developers.

---

## webOS Platform Restrictions

### ❌ Cannot Auto-Launch When TV Becomes Idle

webOS does not expose any API for third-party apps to register as a screensaver or
to auto-launch after an idle timeout. The only apps that can do this are built into the
TV's firmware (LG's own ambient mode / screensaver).

**Workaround**: Launch the app manually once when you turn on the TV. It will run indefinitely.

---

### ❌ Cannot Replace the System Screensaver

LG's built-in screensaver is part of the firmware and cannot be overridden, disabled,
or replaced by a Developer Mode app. If the screensaver activates while LG ScreenBoard
is running, it will cover the app.

**Workaround**: In TV Settings, set the screensaver timeout to the maximum value or disable it
(the option varies by TV model and webOS version).

---

### ❌ Cannot Overlay on Other Apps

webOS does not support picture-in-picture or overlay windows for web apps.
LG ScreenBoard cannot display as a clock overlay on top of YouTube, Netflix, HDMI
input, or any other app.

**No workaround**: This is a fundamental OS limitation.

---

### ❌ Cannot Run in the Background

When another app is launched, LG ScreenBoard is suspended or terminated.
It does not continue updating clocks or fetching weather in the background.

**Workaround**: Press the Back button to return to LG ScreenBoard from other apps
(if it is still in memory). Otherwise, relaunch manually.

---

### ❌ Cannot Draw Over Live TV or Cable

webOS does not allow overlay windows on top of live broadcast, HDMI input,
or cable/satellite tuner content.

**No workaround**: This is a hardware and OS limitation.

---

### ❌ Cannot Detect When Other Apps Stop

There is no webOS API for a web app to monitor the lifecycle of other applications.
LG ScreenBoard cannot automatically resume when Netflix, YouTube, or HDMI ends.

**No workaround**: Relaunch manually.

---

### ❌ Cannot Push Notifications or Alerts

webOS web apps do not have access to the system notification tray. Eclipse countdowns
and other time-sensitive alerts cannot be delivered as push notifications.

**Workaround**: Keep the app running on a secondary screen or check it regularly.

---

### ⚠ Eclipse Data Is Hardcoded Through 2032

The eclipse catalog in `eclipse.js` is sourced from NASA and hardcoded for 2025–2032.
After 2032, the app will show "No eclipse data available" until the file is updated.

**Workaround**: Update `eclipse.js` with new NASA data and reinstall the app.

---

### ⚠ Weather Requires Internet Access

Weather data is fetched over the internet. If the TV is offline, the app will use
cached data for up to 25 minutes. After that, the weather section will show an error
until connectivity is restored.

Weather icons are served from the OpenWeatherMap CDN and require internet access
regardless of which weather API provider is selected.

---

### ⚠ Developer Mode Expires After 50 Hours (Some Models)

On some LG TV models, Developer Mode sessions expire after approximately 50 hours
and must be re-enabled. The installed app remains but may not launch until Developer Mode
is re-enabled.

**Workaround**: Re-enable Developer Mode in TV Settings → Developer Mode.
Some models allow disabling the session expiry countdown.

---

## What Does Work Indefinitely

| Capability | Status |
|---|---|
| Run for hours / days without interruption | ✅ Yes |
| Clock accuracy | ✅ Always accurate (device clock) |
| Offline clock display | ✅ Works without internet |
| Eclipse countdown | ✅ Fully offline |
| Moon phase calculation | ✅ Fully offline |
| Weather with cache | ✅ Up to 25 min without internet |
| Settings persistence after TV reboot | ✅ Via localStorage |

# LG ScreenBoard — Installation Guide

Step-by-step instructions for packaging and deploying LG ScreenBoard to your LG TV.

---

## Prerequisites

- **LG webOS TV** (webOS 3.x – 7.x)
- **Windows, macOS, or Linux** computer on the same Wi-Fi network as the TV
- **Node.js** v14 or later — [nodejs.org](https://nodejs.org)
- **Git** (optional, for cloning) — [git-scm.com](https://git-scm.com)

---

## Step 1 — Enable Developer Mode on the TV

1. On your LG TV remote, press **Settings** (gear icon)
2. Navigate to **General → About This TV**
3. Click on the **TV Version number 5 times** in quick succession
   → A hidden "Developer Mode" menu appears
4. Go back to **Settings → Developer Mode**
5. Toggle **Developer Mode** to **ON**
6. Note the **Key Server IP** shown on screen (usually `keyserver.lgsvl.com`)
7. Note the TV's **IP address**: Settings → Network → Wi-Fi → Advanced → IP Address

> **Note**: On some TV models, Developer Mode sessions expire after ~50 hours.
> If the app stops working, re-enable Developer Mode and re-install.

---

## Step 2 — Install the webOS CLI

```bash
npm install -g @webosose/ares-cli
```

Verify:
```bash
ares-setup-device --version
```

---

## Step 3 — Configure the App

Edit **`config.js`** in the project folder:

```js
// Your location coordinates (for weather accuracy)
LOCATION: {
  lat:  41.8781,    // ← Replace with your latitude
  lon: -87.6298,    // ← Replace with your longitude
  name: 'Chicago, IL'  // ← Your city name (displayed in UI)
},

// Temperature units: 'imperial' (°F) or 'metric' (°C)
WEATHER_UNITS: 'imperial',

// Default time zones (you can change these via the TV remote too)
CLOCKS: [
  { tz: 'America/Chicago', label: 'Central Time', flag: '🇺🇸' },
  { tz: 'Asia/Kolkata',    label: 'India (IST)',  flag: '🇮🇳' }
],
```

> **No API key required** — the app uses Open-Meteo by default (completely free, no registration).
> If you want to use OpenWeatherMap instead, add your key:
> `WEATHER_API_KEY: 'your_key_here'`

---

## Step 4 — Register Your TV as a Target Device

```bash
ares-setup-device
```

When prompted:

| Field | Value |
|---|---|
| Device name | `my-lgtv` (or any name you choose) |
| IP address | Your TV's IP address from Step 1 |
| Port | `9922` |
| Username | `prisoner` |
| Authentication | Passphrase (use the one shown in Developer Mode, or leave blank) |

Test the connection:
```bash
ares-device-info -d my-lgtv
```

You should see your TV's model info.

---

## Step 5 — Package the App

Navigate to the project folder and run:

```bash
cd "LG TV Screen Saver App"
ares-package .
```

This creates:
```
com.screenboard.app_1.0.0_all.ipk
```

---

## Step 6 — Install the App on the TV

```bash
ares-install -d my-lgtv com.screenboard.app_1.0.0_all.ipk
```

The app installs to the TV's app launcher. You should see it as **"LG ScreenBoard"** in the LG launcher bar.

---

## Step 7 — Launch the App

```bash
ares-launch -d my-lgtv com.screenboard.app
```

Or launch it directly from the TV's app launcher.

---

## Step 8 (Optional) — Live Debug with Chrome DevTools

```bash
ares-inspect -d my-lgtv --app com.screenboard.app --open
```

This opens a remote Chrome DevTools session connected to the app running on your TV.
You can view console logs, run `App.moonState()`, `App.nextSolarEclipse()`, etc.

---

## Updating the App

After making changes to any source file:

```bash
ares-package .
ares-install -d my-lgtv com.screenboard.app_1.0.0_all.ipk
ares-launch  -d my-lgtv com.screenboard.app
```

---

## Uninstalling

```bash
ares-install -d my-lgtv --remove com.screenboard.app
```

---

## Disabling the TV Screensaver

To prevent the LG screensaver from covering LG ScreenBoard:

1. Settings → General → **Screen Saver** or **Screensaver**
2. Set **Screensaver Timer** to the maximum value or **Off**

*(Location varies by webOS version — some models call it "Screen Saver", others don't offer an off switch)*

---

## Troubleshooting

| Problem | Likely Cause | Solution |
|---|---|---|
| `ares-install` fails | TV not reachable | Check IP, ensure same Wi-Fi, re-run `ares-setup-device` |
| "Invalid device" error | TV Developer Mode expired | Re-enable Developer Mode on TV |
| Weather shows spinner forever | Internet blocked or wrong lat/lon | Check TV network settings; verify coordinates in config.js |
| Weather shows OWM key error | Wrong provider selected | In remote settings, switch to Open-Meteo (← →) |
| App not in LG launcher | Install completed but app hidden | Scroll to end of launcher bar; look for "LG ScreenBoard" |
| Clock shows wrong time | TV system clock wrong | Sync TV time in Settings → General → Date & Time |
| Eclipse shows "no data" | Year is past 2032 | Update eclipse.js with new NASA catalog data |

---

## Developer Mode Notes

- Developer Mode must remain **ON** for installed apps to run
- Some TVs time out Developer Mode after ~50 hours and show a warning
- The installed `.ipk` stays on the TV even if Developer Mode expires
- Re-enabling Developer Mode restores app launch capability without reinstalling
- To prevent expiry on some models: in Developer Mode settings, disable "Session timeout"

---

## Using the Push Script (Windows)

If you're on Windows, a one-click PowerShell script is included:

```powershell
# Open PowerShell in the project folder and run:
.\PUSH_TO_GITHUB.ps1
```

This handles git initialization, commit, and push to GitHub automatically.

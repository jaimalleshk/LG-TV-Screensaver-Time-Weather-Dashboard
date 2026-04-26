# LG ScreenBoard — Build & Deployment Guide

## Prerequisites

### 1. Node.js + webOS CLI (ares-webos-cli)
```bash
npm install -g @webosose/ares-cli
# Verify install
ares-setup-device --version
```

### 2. LG Developer Mode (one-time TV setup)
1. On your LG TV, open **Settings → General → About This TV**
2. Click on the **TV Version** number **5 times quickly** → "Developer Mode" appears
3. Go to **Settings → Developer Mode** → toggle **Developer Mode ON**
4. Note the TV's **IP address** (Settings → Network → Wi-Fi Connection → Advanced)

---

## Step 1 — Configure the App

Edit **`config.js`** before packaging:

```js
WEATHER_API_KEY: 'your_real_key_here',

LOCATION: {
  lat:  41.8781,    // ← your latitude
  lon: -87.6298,    // ← your longitude
  name: 'Chicago, IL'
},

WEATHER_UNITS: 'imperial',  // 'imperial' (°F) or 'metric' (°C)
```

### Get a free OpenWeatherMap API key
1. Register at https://openweathermap.org/api
2. Go to **My API Keys** → copy your default key
3. For 8-day forecast: subscribe to **One Call API 3.0** (free tier: 1,000 calls/day)
   - The app automatically falls back to the free 5-day 2.5 API if 3.0 is unavailable

---

## Step 2 — Package the App

```bash
# Navigate to the project root (contains index.html + appinfo.json)
cd path/to/LG\ TV\ Screen\ Saver\ App/

# Package into an .ipk file
ares-package .

# Output: com.screenboard.app_1.0.0_all.ipk
```

---

## Step 3 — Register Your TV as a Target Device

```bash
ares-setup-device
```

Follow the prompts:
- **Device name**: `my-lgtv` (any name you choose)
- **IP address**: TV's IP from Step 0
- **Port**: `9922` (webOS default SSH port)
- **Username**: `prisoner`
- **Authentication**: Passphrase (leave blank or use the passphrase shown in Developer Mode)

Test the connection:
```bash
ares-device-info -d my-lgtv
```

---

## Step 4 — Install the App

```bash
ares-install -d my-lgtv com.screenboard.app_1.0.0_all.ipk
```

---

## Step 5 — Launch the App

```bash
ares-launch -d my-lgtv com.screenboard.app
```

---

## Step 6 — Watch Logs (optional but useful)

```bash
ares-inspect -d my-lgtv --app com.screenboard.app --open
```

This opens a Chrome DevTools inspector connected to the TV for live debugging.

---

## Updating the App

After editing any file, re-package and re-install:

```bash
ares-package . && ares-install -d my-lgtv com.screenboard.app_1.0.0_all.ipk
ares-launch -d my-lgtv com.screenboard.app
```

---

## Uninstall

```bash
ares-install -d my-lgtv --remove com.screenboard.app
```

---

## Folder Structure (reference)

```
LG TV Screen Saver App/
├── appinfo.json          ← webOS app manifest (REQUIRED)
├── index.html            ← Main UI layout
├── styles.css            ← All styling
├── config.js             ← Your API key + settings (edit this)
├── app.js                ← Main orchestrator + burn-in scheduler
├── weather.js            ← OpenWeatherMap integration
├── moon.js               ← Moon phase calculator + Canvas renderer
├── utils/
│   └── time.js           ← Dual-timezone clock
└── assets/
    └── icon.png          ← App icon (replace with your own 80×80 PNG)
    └── largeIcon.png     ← Large icon (130×130 PNG)
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `ares-package` fails | Make sure `appinfo.json` is in the root directory |
| Weather shows "Set your API key" | Edit `config.js`, re-package and re-install |
| Weather shows "retry" errors | Check TV internet connection; OWM 2.5 fallback needs any free key |
| App not visible on TV home screen | Developer Mode may have timed out — re-enable it on the TV |
| Icons not loading | TV firewall may block OWM CDN — test with `ares-inspect` |
| Clock shows wrong time | Verify the TV's system time zone; `Intl` uses the browser clock |

---

## Optional Enhancements

### A. Auto-launch on TV startup
In webOS, apps don't auto-start unless set as the default launcher.
A workaround is to create a shell script that calls `ares-launch` on your
home network whenever the TV is detected:
```bash
# Example (macOS/Linux cron job every 5 min)
# ping -c1 192.168.1.x &>/dev/null && ares-launch -d my-lgtv com.screenboard.app
```

### B. Change location / add a second weather city
Edit `CONFIG.LOCATION` in `config.js`. For a second city, duplicate
the weather section in `index.html` and call `Weather.start()` a second
time with a different config object (refactor `weather.js` to accept
a config parameter).

### C. Switch to Celsius
In `config.js`:
```js
WEATHER_UNITS: 'metric'
```

### D. Disable burn-in drift (for LCD TVs)
In `config.js`:
```js
BURN_IN_MAX_DRIFT: 0
```

### E. Extend to 3 time zones
In `utils/time.js`, duplicate the formatter and add a third
`<div class="clock-block">` in `index.html`.

---

*LG ScreenBoard v1.0.0 — built for webOS 3.x–7.x*

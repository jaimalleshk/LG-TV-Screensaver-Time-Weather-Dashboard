# LG ScreenBoard

**A full-screen, burn-in-safe dashboard for LG webOS TVs**

Displays dual time zones, 8-day weather forecast, moon phases, and upcoming solar & lunar eclipse countdowns — all in a clean, TV-optimized layout designed to run indefinitely on any LG webOS TV.

![LG ScreenBoard](assets/screenshot.png)

---

## Why This Project Exists

LG webOS TVs do not offer:

- A customizable screensaver or idle dashboard
- Any way to show dual time zones or a persistent clock
- Any way to display weather, moon phases, or eclipse information
- Any clock overlay that works on top of other content
- A way to replace the built-in screensaver with custom content
- Any mechanism to auto-launch a custom app when the TV becomes idle

The LG Content Store does not allow screensaver or dashboard apps from third-party developers.

**LG ScreenBoard fills this gap** by providing a persistent, always-on information display that users install via Developer Mode and launch manually. Once running, it stays on indefinitely.

---

## Features at a Glance

| Module | What You See |
|---|---|
| 🕒 Dual Clocks | Up to 4 configurable time zones, large TV-readable fonts |
| 🌤 Weather | 8-day forecast, icons, hi/lo temps, current conditions |
| 🌙 Moon Phase | Current phase, illumination %, canvas-rendered disc |
| 🌑 Solar Eclipses | Next solar eclipse, type, countdown, path |
| 🌕 Lunar Eclipses | Next lunar eclipse, type, countdown, visibility |
| 🔒 Burn-in Safe | Random X/Y layout drift every 60 seconds |
| ⚙ Remote Settings | All settings configurable via TV remote — no keyboard needed |

---

## Quick Start

### 1. Configure

Edit **`config.js`** and set your location:

```js
LOCATION: {
  lat:  41.8781,   // your latitude
  lon: -87.6298,   // your longitude
  name: 'Chicago, IL'
},
WEATHER_UNITS: 'imperial',  // 'imperial' (°F) or 'metric' (°C)
```

No API key needed — the app uses **Open-Meteo** by default (free, no registration).

### 2. Package

```bash
cd "LG TV Screen Saver App"
ares-package .
```

### 3. Install & Launch

```bash
ares-install -d my-lgtv com.screenboard.app_1.0.0_all.ipk
ares-launch  -d my-lgtv com.screenboard.app
```

For full setup instructions, see [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md).

---

## Remote Control Usage

| Button | Action |
|---|---|
| **OK / Enter** | Open Settings overlay |
| **↑ / ↓** | Navigate between settings rows |
| **← / →** | Change value (timezone, weather API, units) |
| **OK** on a clock row | Toggle that clock ON / OFF |
| **BACK** | Save settings and close overlay |
| **BACK** (dashboard) | Exit app |

### What You Can Configure via Remote

- Up to **4 time zones** — choose from 30 built-in options spanning every continent
- **Weather API** — switch between Open-Meteo (free) and OpenWeatherMap
- **Temperature units** — toggle between °F and °C

All settings persist across TV reboots via local storage.

---

## Weather APIs

| Provider | Cost | API Key | Forecast | Notes |
|---|---|---|---|---|
| **Open-Meteo** *(default)* | Free | None | 8-day daily | No account needed |
| OpenWeatherMap | Free tier | Required | 8-day (3.0) / 5-day (2.5) | Auto-detects plan |

Switch providers at any time via the remote settings panel — no repackaging needed.

---

## Eclipse Data

Eclipse dates are sourced from the **NASA Eclipse Website** catalog (`eclipse.gsfc.nasa.gov`) and cover **2025–2032**. The module is fully offline — no network request is needed.

| Field | Solar | Lunar |
|---|---|---|
| Type shown | Total / Annular / Hybrid / Partial | Total / Partial / Penumbral |
| Countdown | Days until next event | Days until next event |
| Path info | Annular/total path region | Night-side visibility |
| Duration | Totality duration (where applicable) | Totality duration |

---

## File Structure

```
LG TV Screen Saver App/
├── appinfo.json         ← webOS app manifest
├── index.html           ← Dashboard layout
├── styles.css           ← All CSS (TV-optimized)
├── config.js            ← Your settings (edit this)
├── app.js               ← Boot + remote settings panel
├── weather.js           ← Weather (Open-Meteo + OWM)
├── moon.js              ← Moon phase algorithm + Canvas renderer
├── eclipse.js           ← Solar & lunar eclipse catalog
├── utils/
│   └── time.js          ← Multi-timezone clock
└── assets/
    ├── icon.png         ← App icon (80×80)
    └── largeIcon.png    ← Large icon (130×130)
```

---

## Platform Requirements

- **LG webOS TV** — versions 3.x through 7.x
- **webOS CLI** (`@webosose/ares-cli`) for packaging and deployment
- **Developer Mode** enabled on the TV
- **Internet connection** on the TV (for weather icons and initial weather fetch)

---

## Limitations

See [LIMITATIONS.md](LIMITATIONS.md) for the full list of webOS platform constraints.
Key ones: cannot auto-launch, cannot overlay on other apps, cannot run in the background.

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) — includes sunrise/sunset, AQI, eclipse path visualization, multi-city weather, and more.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT License — free to use, modify, and distribute.

---

## Acknowledgements

- [Open-Meteo](https://open-meteo.com) — free open-source weather API
- [OpenWeatherMap](https://openweathermap.org) — weather icons and API
- [NASA Eclipse Website](https://eclipse.gsfc.nasa.gov) — eclipse catalog data
- [LG webOS Developer Docs](https://webostv.developer.lge.com) — platform reference

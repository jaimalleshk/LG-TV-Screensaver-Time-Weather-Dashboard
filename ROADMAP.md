# LG ScreenBoard — Roadmap

Planned improvements and future features, roughly ordered by priority.

---

## 🔜 Near-Term (v1.1)

### Sunrise & Sunset Times
- Calculate local sunrise and sunset using the NOAA algorithm (no API needed)
- Display in the bottom section alongside moon phase
- Show golden hour and civil twilight times

### Air Quality Index (AQI)
- Integrate Open-Meteo's free air quality endpoint
- Show PM2.5, PM10, and US AQI index
- Color-coded indicator (Good / Moderate / Unhealthy)

### Wind Direction
- Add compass direction to the wind speed display (e.g., "12 mph NW")
- Available in both Open-Meteo and OWM responses

### Feels-Like Temperature on Forecast Cards
- Currently shown for current conditions only
- Add feels-like to each daily forecast card

---

## 🗓 Medium-Term (v1.2)

### Multi-Location Weather
- Allow configuring a second city for weather
- Split weather section or tabbed view navigable by remote

### Background Themes
- Optional subtle background — star field, gradient, or minimal animated texture
- Selectable via remote settings
- Must remain burn-in safe (no static bright pixels)

### Auto-Dark Mode
- Detect local time and dim the display between midnight and 6am
- Configurable brightness curve
- Useful for bedrooms where the TV stays on overnight

### Precipitation Probability
- Show rain/snow probability % on each forecast card
- Available from Open-Meteo and OWM

### Hourly Forecast View
- Optional toggle to show today's hourly breakdown instead of 8-day view
- Navigable via remote ← →

---

## 🔭 Long-Term (v2.0)

### Eclipse Path Visualization
- SVG world map showing the annular/total eclipse path
- Highlights regions that can see totality vs. partial eclipse
- Uses NASA's eclipse path coordinate data

### Eclipse Magnitude & Obscuration %
- Show eclipse magnitude (how much of the sun is covered)
- Show obscuration percentage for the user's specific location
- Requires lookup table or simple calculation from user coordinates

### Saros Series Information
- Show which Saros series the next eclipse belongs to
- Educational detail for astronomy enthusiasts

### Planetary Events
- Next planet visibility windows (e.g., "Mars visible tonight at 10pm")
- Opposition dates for outer planets
- Venus/Mercury elongation peaks

### Comet Alerts
- Notable periodic comets (Halley, etc.) with next perihelion
- Bright comet alerts (mag < 6.0) from a curated list

---

## 📺 Platform Ports

### Android TV / Google TV
- Port to Android TV using the same HTML/JS via WebView wrapper
- Supports auto-launch via DreamService (screensaver API)
- Could auto-start as a true screensaver — eliminates the main webOS limitation

### Amazon Fire TV
- Similar WebView wrapper approach
- Fire TV screensaver API available for sideloaded apps

### Raspberry Pi Kiosk Mode
- Run in Chromium kiosk mode on a Pi connected via HDMI
- Full screensaver auto-start support via systemd or cron
- No developer mode needed — fully open platform

### LG webOS Signage
- LG offers a separate "Signage" webOS SDK for commercial displays
- Port would enable deployment in lobbies, airports, offices
- Supports auto-boot and kiosk lock mode

---

## 🛠 Developer Experience

### Test Harness
- Automated Playwright tests for weather parsing, moon calculation, eclipse logic
- Mock API responses for offline CI testing

### Config UI (Web-based)
- A companion webpage for entering coordinates, API keys, and preferences
- Generates a pre-filled `config.js` for download
- Avoids needing to manually edit the JS file

### OTA Update Check
- On launch, silently check GitHub Releases API for newer versions
- Show a dismissable update badge in settings if a newer version exists

### Webpack / Vite Build
- Optional bundled build for smaller `.ipk` size
- Minified JS and inlined CSS

---

## 🌍 Localization

### Multi-Language Support
- Date/time labels in user's language via `Intl` API
- Weather condition text in local language (OWM supports this natively)
- UI text externalized to a `strings.js` locale file

### 12h / 24h Clock Toggle
- Add a settings row to switch between 12-hour and 24-hour format
- Persisted via localStorage

---

## ✅ Completed (v1.0)

- Dual time zones with DST support
- Open-Meteo weather (free, no key)
- OpenWeatherMap fallback
- 8-day forecast with icons
- Moon phase algorithm + canvas rendering
- Next 4 moon phases
- Solar eclipse catalog (2025–2032)
- Lunar eclipse catalog (2025–2032)
- Burn-in prevention (random X/Y drift)
- Remote-control settings panel (4 clocks + weather API + units)
- localStorage persistence
- webOS packaging (`appinfo.json`, `.ipk`)
- Full GitHub documentation

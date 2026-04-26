# Contributing to LG ScreenBoard

Thank you for your interest in contributing! This document explains how to get started,
what the codebase looks like, and what makes a good pull request.

---

## Getting Started

### 1. Fork the repository

Click **Fork** on the GitHub repository page to create your own copy.

### 2. Clone your fork

```bash
git clone https://github.com/YOUR_USERNAME/LG-TV-Screensaver-Time-Weather-Dashboard.git
cd LG-TV-Screensaver-Time-Weather-Dashboard
```

### 3. Install the webOS CLI (for testing on a TV)

```bash
npm install -g @webosose/ares-cli
```

---

## Running Locally (Browser Preview)

You can preview the app in any modern browser without a TV.

### Option A — Direct file open

Simply open `index.html` in Chrome or Firefox:

```
file:///path/to/LG TV Screen Saver App/index.html
```

> Weather icons require internet. Weather data will load if Open-Meteo is reachable.
> Moon phase and eclipse sections are fully offline.

### Option B — Local HTTP server (recommended)

```bash
# Python 3
cd "LG TV Screen Saver App"
python3 -m http.server 8080

# Then open: http://localhost:8080
```

Or with Node:

```bash
npx serve .
```

### Browser console shortcuts

Open DevTools (`F12`) and use these:

```js
App.openSettings()          // Open settings overlay
App.moonState()             // Current moon phase data
App.nextSolarEclipse()      // Next solar eclipse
App.nextLunarEclipse()      // Next lunar eclipse
App.forceWeatherUpdate()    // Re-fetch weather immediately
App.clearCache()            // Clear all localStorage caches
```

---

## Packaging for TV

```bash
cd "LG TV Screen Saver App"
ares-package .
ares-install -d my-lgtv com.screenboard.app_1.0.0_all.ipk
ares-launch  -d my-lgtv com.screenboard.app
```

See [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) for full setup instructions.

---

## Codebase Overview

```
├── config.js       Central config — API keys, location, clocks, intervals
├── app.js          Boot orchestrator + remote settings panel (all key handling)
├── weather.js      Weather data — Open-Meteo primary, OWM fallback
├── moon.js         Moon phase algorithm (Julian date) + Canvas renderer
├── eclipse.js      Solar & lunar eclipse catalog (NASA data, 2025–2032)
├── utils/time.js   Multi-timezone clock — builds DOM, ticks every second
├── index.html      Layout — clocks, weather, moon, eclipse sections
└── styles.css      All styles — TV-optimized, OLED-safe, settings overlay
```

Each module is an **IIFE** (immediately invoked function expression) that exposes a clean
public API via a `return {}` at the bottom. They communicate through `CONFIG` (global) and
direct DOM manipulation.

---

## Coding Style

### General

- **Vanilla JS only** — no frameworks, no build step required
- **ES6+** features are fine (webOS 3.x+ has a modern V8 engine)
- **No external runtime dependencies** — everything must work offline after install
- Use `const` and `let`; avoid `var`
- Prefer `async/await` over `.then()` chains

### Naming

- Module objects: `PascalCase` — `MoonPhase`, `Weather`, `EclipseModule`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS IDs: `kebab-case` prefixed with context (`weather-`, `moon-`, `eclipse-`)
- CSS classes: `kebab-case`

### Comments

- Add a JSDoc-style block comment at the top of every module file
- Comment non-obvious math or algorithms (the moon phase and eclipse calculations especially)
- Inline comments for anything a reviewer might question

### CSS

- All colors via CSS custom properties (`var(--accent)`, etc.) — no hardcoded hex in component rules
- Never use `!important`
- Keep burn-in animations in the dedicated section at the bottom of `styles.css`

---

## Adding a New Weather Provider

1. Add the provider to the `PROVIDERS` object in `weather.js`
2. Write an async `fetchYourProvider()` function that returns `{ current, daily }`
   in the normalized format (see existing functions for the expected shape)
3. Add a branch in the `fetchWeather()` master function
4. Add the new provider ID to `PROVIDER_ORDER` in `app.js`
5. Test with the browser console: `App.forceWeatherUpdate()`

---

## Updating the Eclipse Catalog

When new NASA eclipse data is available:

1. Visit [eclipse.gsfc.nasa.gov](https://eclipse.gsfc.nasa.gov)
2. Add new entries to `SOLAR_ECLIPSES` and `LUNAR_ECLIPSES` arrays in `eclipse.js`
3. Follow the existing object shape: `{ date, type, label, path/vis, mag, duration? }`
4. Dates must be `new Date('YYYY-MM-DDTHH:MM:SSZ')` in UTC

---

## Pull Request Guidelines

### Before submitting

- [ ] Test in a browser (Chrome recommended)
- [ ] Test on a real LG TV if possible (especially key navigation changes)
- [ ] Run through all settings panel rows to confirm navigation still works
- [ ] Check that burn-in drift still applies after your changes
- [ ] Ensure no hardcoded API keys or personal coordinates are in the diff

### PR description should include

- **What** the change does
- **Why** it's needed or valuable
- **How** to test it
- Screenshots or video if it affects the UI

### Branch naming

```
feature/sunrise-sunset
fix/eclipse-countdown-off-by-one
docs/update-installation-guide
```

---

## Issue Templates

### Bug Report

```
**What happened:**

**Expected behavior:**

**Steps to reproduce:**
1.
2.
3.

**TV model / webOS version:**

**Browser (if testing in browser):**

**Console output (F12 → Console):**
```

### Feature Request

```
**What would you like added:**

**Why is this valuable:**

**Where in the layout would it appear:**

**Any data source or API in mind:**
```

---

## Code of Conduct

Be respectful and constructive. This is a small hobby project — keep feedback kind and
focused on the code, not the person.

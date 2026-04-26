# LG ScreenBoard — Feature Reference

Complete documentation of every feature included in the app.

---

## 🕒 Multi-Timezone Clocks

- **Up to 4 simultaneous clocks** — show 1, 2, 3, or 4 time zones at once
- **30 built-in timezones** covering every major region worldwide
- **DST-aware** — uses the native `Intl.DateTimeFormat` API, which automatically handles Daylight Saving Time transitions
- **Large, TV-readable fonts** — clock digits at 4.2rem, date at 1.7rem
- **Tabular-numeric rendering** — prevents layout jitter as seconds change
- **Configurable via remote** — no repackaging required; changes save to local storage

### Default time zones

| Slot | Zone | Label |
|---|---|---|
| 1 | `America/Chicago` | Central Time (US) 🇺🇸 |
| 2 | `Asia/Kolkata` | India (IST) 🇮🇳 |
| 3–4 | Your choice | Configurable via remote |

### Available timezone options (30 total)

Eastern · Central · Mountain · Pacific · Alaska · Hawaii · Toronto · Vancouver · Sao Paulo · London · Paris · Berlin · Rome · Moscow · Cairo · Johannesburg · Dubai · Karachi · India · Dhaka · Bangkok · Singapore · Shanghai · Hong Kong · Tokyo · Seoul · Sydney · Perth · Auckland · UTC

---

## 🌤 Weather Forecast

### Providers

| Provider | Default | API Key | Forecast Length |
|---|---|---|---|
| **Open-Meteo** | ✅ Yes | None needed | 8-day daily |
| OpenWeatherMap | No | Required (free) | 8-day (3.0) / 5-day (2.5) |

### What is displayed

- **Current conditions** — temperature, feels-like, humidity, wind speed, condition text
- **8-day daily forecast** — each day shows:
  - Day name and date
  - Weather icon (from OWM CDN, using mapped WMO codes)
  - High / low temperature
  - Condition description
- **Today card** highlighted with an accent border

### Refresh behavior

- Fetches fresh data **every 30 minutes**
- **localStorage cache** survives TV reboots and app restarts (25-minute TTL)
- **Exponential backoff retry** on network failure (up to 5 retries, capped at 10 min)
- Falls back to cached data while retrying

### Switching providers via remote

Press **OK** → Settings → navigate to **Weather API row** → press **← / →** to switch between Open-Meteo and OpenWeatherMap. Changes take effect immediately after closing settings.

---

## 🌙 Moon Phase

### Algorithm

Uses a **Julian-date-based calculation** anchored to a known New Moon (January 6, 2000 18:14 UTC). Accurate to within 1–2 hours. No network request required — fully offline.

- **Cycle day** — how many days into the current 29.53-day lunar cycle
- **Illumination %** — calculated via cosine formula
- **Phase classification** — 8 named phases with proper day boundaries

### Moon disc rendering

The moon is drawn on an HTML5 **Canvas element** using geometric arc calculations:

- Correct crescent shapes for waxing and waning phases
- Proper elliptical terminator (boundary between lit and dark)
- Subtle surface gradient texture
- Soft glow ring outline

### What is displayed

- Canvas moon disc (100×100px, mathematically rendered)
- Phase name (New Moon, Waxing Crescent, etc.)
- Illumination percentage
- Day number in current cycle
- Next 4 major phases with dates and countdown

### Refresh interval

Every 12 hours (and on page resume after TV input switch).

---

## 🌑 Solar Eclipse Module

### Data source

NASA Eclipse Website catalog (`eclipse.gsfc.nasa.gov`), hardcoded for **2025–2032**. Fully offline — no API call needed.

### What is displayed

- **Eclipse type** — color-coded badge:
  - 🟡 Total (gold)
  - 🟠 Annular (orange)
  - 🟣 Hybrid (purple-pink)
  - 🔵 Partial (blue)
- **Date** — full calendar date of peak eclipse
- **Countdown** — human-readable ("In 3 months", "Tomorrow", "In 47 days")
- **Path description** — which regions can see the total/annular path
- **Totality duration** — for total and annular eclipses

### Upcoming solar eclipses covered

| Date | Type |
|---|---|
| 2025 Mar 29 | Partial |
| 2025 Sep 21 | Partial |
| 2026 Feb 17 | Annular |
| 2026 Aug 12 | Total ⭐ |
| 2027 Feb 06 | Annular |
| 2027 Aug 02 | Total ⭐ |
| 2028 Jan 26 | Annular |
| 2028 Jul 22 | Total |
| 2030 Jun 01 | Annular |
| 2030 Nov 25 | Total |
| 2031 May 21 | Annular |
| 2031 Nov 14 | Hybrid |
| 2032 May 09 | Annular |

---

## 🌕 Lunar Eclipse Module

### Data source

Same NASA catalog, hardcoded 2025–2032. Offline.

### What is displayed

- **Eclipse type** — color-coded (Total, Partial, Penumbral)
- **Date** of peak eclipse (UTC)
- **Countdown** in human-readable format
- **Visibility note** — which regions of Earth can observe it
- **Totality duration** — for total lunar eclipses

### Upcoming lunar eclipses covered

| Date | Type |
|---|---|
| 2025 Mar 14 | Total |
| 2025 Sep 07 | Total |
| 2026 Mar 03 | Total |
| 2026 Aug 28 | Partial |
| 2027 Feb 20 | Total |
| 2027 Aug 17 | Partial |
| 2028 Jan 12 | Total |
| 2028 Jul 06 | Partial |
| 2028 Dec 31 | Total |
| 2029 Jun 26 | Total ⭐ |
| 2029 Dec 20 | Total |
| 2030 Jun 15 | Partial |
| 2030 Dec 09 | Total |

---

## 🔥 Burn-In Prevention

Designed specifically for **LG OLED panels**, which are susceptible to image retention if static content is displayed for extended periods.

### Techniques used

| Technique | Implementation | Interval |
|---|---|---|
| **Random X/Y drift** | Shifts entire layout ±10px in both axes | Every 60 seconds |
| **Smooth transition** | CSS `transform` with 1.2s ease — invisible at TV distance | Per shift |
| **Icon shimmer** | Weather icons pulse opacity (1.0 → 0.7 → 1.0) | Every weather refresh |
| **Dynamic content** | Clock updates every second — no pixel is ever truly static | Continuous |

The drift amount is configurable in `config.js` (`BURN_IN_MAX_DRIFT`). Set to `0` to disable (for LCD TVs).

---

## ⚙ Remote Control Settings Panel

All settings are configurable **without a keyboard** using the standard LG TV remote.

### How to open

Press **OK / Enter** (center D-pad button) on the TV remote from the dashboard.

### Navigation

| Key | Action |
|---|---|
| **↑ / ↓** | Move between settings rows |
| **← / →** | Cycle through options for the focused row |
| **OK** | Toggle clock slot ON / OFF |
| **BACK** | Save all changes and close |

### Configurable settings

| Row | Setting | Options |
|---|---|---|
| 1–4 | Clock time zones | 30 timezones (← → to cycle) |
| 1–4 | Clock active/inactive | OK to toggle |
| 5 | Weather API provider | Open-Meteo ↔ OpenWeatherMap |
| 6 | Temperature units | °F ↔ °C |

### Persistence

All settings are saved to the TV's **localStorage** automatically when you press BACK. They survive app restarts and TV reboots.

---

## 🧱 Layout & Typography

- **Resolution**: Optimized for 1920×1080 (Full HD)
- **Background**: Pure black `#000000` — safe for OLED, maximizes contrast
- **Font sizes**:
  - Clock time: 4.2rem
  - Clock date: 1.7rem
  - Weather temps: 2.0rem
  - Condition text: 1.2–1.4rem
  - Moon phase name: 2.6rem
  - Eclipse countdown: 2.0rem
- **Three-zone vertical layout**:
  - Top: Clocks
  - Middle: Weather (flexible height)
  - Bottom: Moon + Solar Eclipse + Lunar Eclipse
- **Color palette**: Black background, white primary text, `#4A90D9` accent blue, color-coded eclipse type badges

---

## 📦 Packaging

- Packaged as a `.ipk` using `ares-package`
- Installed via `ares-install`
- Launched via `ares-launch`
- Compatible with **webOS 3.x – 7.x**
- App ID: `com.screenboard.app`

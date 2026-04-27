# LG ScreenBoard — Comparison Matrix

How LG ScreenBoard compares to the built-in LG screensaver and Content Store apps.

> **Note on Content Store weather apps:** Apps such as **AccuWeather** are available in the LG Content Store and provide weather forecasts. The comparison below reflects that distinction — rows that were previously marked ❌ for Content Store apps have been corrected.

---

## Feature Comparison

| Feature | LG Built-in Screensaver | LG Content Store Apps | **LG ScreenBoard** |
|---|:---:|:---:|:---:|
| **Clock / Time Display** | ❌ | Some | ✅ |
| **Dual Time Zones** | ❌ | ❌ | ✅ |
| **Up to 4 Time Zones** | ❌ | ❌ | ✅ |
| **7-Day Weather Forecast** | ❌ | ✅ (e.g. AccuWeather) | ✅ |
| **Weather as Part of a Dashboard** | ❌ | ❌ (standalone app) | ✅ (integrated) |
| **Weather Without Account / Login** | ❌ | ❌ (AccuWeather requires account) | ✅ (Open-Meteo, no account) |
| **Weather Without API Key** | ❌ | ✅ (handled by app) | ✅ (Open-Meteo) |
| **Moon Phase + Illumination** | ❌ | ❌ | ✅ |
| **Moon Phase Canvas Rendering** | ❌ | ❌ | ✅ |
| **Next 4 Upcoming Moon Phases** | ❌ | ❌ | ✅ |
| **Solar Eclipse Info + Countdown** | ❌ | ❌ | ✅ |
| **Lunar Eclipse Info + Countdown** | ❌ | ❌ | ✅ |
| **Eclipse Type + Path Details** | ❌ | ❌ | ✅ |
| **Calendar / Full Date Display** | ❌ | Some | ✅ |
| **Burn-in Safe (OLED Drift)** | ✅ (basic) | ❌ | ✅ (random X/Y) |
| **Configurable via TV Remote** | ❌ | ❌ | ✅ |
| **No Account / Login Required** | ✅ | Varies | ✅ |
| **Fully Offline (core features)** | ✅ | ❌ | ✅ |
| **Persistent localStorage Settings** | N/A | ❌ | ✅ |
| **Auto-Launch on Idle** | ✅ | ❌ | ❌ (webOS limit) |
| **Overlay on Other Apps** | ❌ | ❌ | ❌ (webOS limit) |
| **Runs Indefinitely When Launched** | ✅ | ✅ | ✅ |
| **Free to Use** | ✅ | Varies | ✅ |
| **Open Source** | ❌ | ❌ | ✅ |

---

## Weather Provider Comparison

| Provider | Cost | API Key | Forecast | Coverage | Notes |
|---|:---:|:---:|:---:|:---:|---|
| **Open-Meteo** *(default)* | Free | None | 8-day daily | Global | Open-source, no registration |
| OpenWeatherMap (3.0) | Free tier | Required | 8-day daily | Global | Best data quality |
| OpenWeatherMap (2.5) | Free | Required | 5-day / 3h | Global | Auto-fallback if 3.0 fails |

---

## Eclipse Data Comparison

| Source | Cost | Accuracy | Coverage | Offline |
|---|:---:|:---:|:---:|:---:|
| **NASA Eclipse Catalog** *(built-in)* | Free | Sub-minute | 2025–2032 | ✅ Yes |
| timeanddate.com API | Paid | High | Ongoing | ❌ No |
| AstronomyAPI.com | Paid | High | Ongoing | ❌ No |
| USNO API | Free | High | Limited | ❌ No |

LG ScreenBoard uses hardcoded NASA catalog data — no API call, no key, works offline forever.

---

## Platform Comparison

| Capability | LG webOS | Android TV | Fire TV | Raspberry Pi (Kiosk) |
|---|:---:|:---:|:---:|:---:|
| Packaged web app support | ✅ | ✅ | ✅ | ✅ |
| No-install screensaver mode | ❌ | ❌ | ❌ | ✅ |
| Developer Mode (no fee) | ✅ | ✅ | ✅ | N/A |
| Auto-launch on idle | ❌ | ❌ | ❌ | ✅ |
| Remote control navigation | ✅ | ✅ | ✅ | Varies |
| OLED burn-in risk | High | Low | Low | Low |

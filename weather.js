/**
 * LG ScreenBoard — weather.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Weather data with multi-provider support.
 *
 * PROVIDERS (selectable via remote settings or config.js):
 *
 *   "openmeteo"  — Open-Meteo  (DEFAULT)
 *                  Free · No API key · No account · Global coverage
 *                  8-day daily forecast · Current conditions
 *                  https://open-meteo.com
 *
 *   "owm"        — OpenWeatherMap
 *                  Free tier (2.5 API) + paid One Call 3.0
 *                  Requires API key in CONFIG.WEATHER_API_KEY
 *                  https://openweathermap.org/api
 *
 * Provider is stored in CONFIG.WEATHER_PROVIDER and persists via localStorage.
 * Switch at runtime via the remote settings panel (OK on TV remote → Settings).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Weather = (() => {

  // ─── Provider registry ───────────────────────────────────────────────────

  const PROVIDERS = {
    openmeteo: { id: 'openmeteo', label: 'Open-Meteo (Free)',          needsKey: false },
    owm:       { id: 'owm',       label: 'OpenWeatherMap (Key Needed)', needsKey: true  }
  };

  // ─── WMO weather code mapping (Open-Meteo uses WMO codes) ────────────────
  // Maps WMO code → { description, owmIconCode }
  // owmIconCode is used to build OWM-style icon URLs (reuses OWM CDN)

  const WMO = {
    0:  { desc: 'Clear sky',              icon: '01' },
    1:  { desc: 'Mainly clear',           icon: '01' },
    2:  { desc: 'Partly cloudy',          icon: '02' },
    3:  { desc: 'Overcast',               icon: '04' },
    45: { desc: 'Fog',                    icon: '50' },
    48: { desc: 'Icy fog',                icon: '50' },
    51: { desc: 'Light drizzle',          icon: '09' },
    53: { desc: 'Moderate drizzle',       icon: '09' },
    55: { desc: 'Dense drizzle',          icon: '09' },
    56: { desc: 'Freezing drizzle',       icon: '09' },
    57: { desc: 'Heavy freezing drizzle', icon: '09' },
    61: { desc: 'Light rain',             icon: '10' },
    63: { desc: 'Moderate rain',          icon: '10' },
    65: { desc: 'Heavy rain',             icon: '10' },
    66: { desc: 'Freezing rain',          icon: '13' },
    67: { desc: 'Heavy freezing rain',    icon: '13' },
    71: { desc: 'Light snow',             icon: '13' },
    73: { desc: 'Moderate snow',          icon: '13' },
    75: { desc: 'Heavy snow',             icon: '13' },
    77: { desc: 'Snow grains',            icon: '13' },
    80: { desc: 'Light showers',          icon: '09' },
    81: { desc: 'Moderate showers',       icon: '09' },
    82: { desc: 'Violent showers',        icon: '09' },
    85: { desc: 'Light snow showers',     icon: '13' },
    86: { desc: 'Heavy snow showers',     icon: '13' },
    95: { desc: 'Thunderstorm',           icon: '11' },
    96: { desc: 'Thunderstorm w/ hail',   icon: '11' },
    99: { desc: 'Thunderstorm w/ hail',   icon: '11' }
  };

  const OWM_ICON_BASE = 'https://openweathermap.org/img/wn';
  const CACHE_KEY     = 'screenboard_weather_cache';
  const CACHE_TTL_MS  = 25 * 60 * 1000;

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function iconUrl(code) {
    return `${OWM_ICON_BASE}/${code}@2x.png`;
  }

  function wmoIconUrl(wmoCode) {
    const entry = WMO[wmoCode] || WMO[0];
    return iconUrl(entry.icon + 'd');   // 'd' = daytime icon
  }

  function wmoDesc(wmoCode) {
    return (WMO[wmoCode] || WMO[0]).desc;
  }

  function unitSymbol() {
    return CONFIG.WEATHER_UNITS === 'metric' ? '°C' : CONFIG.WEATHER_UNITS === 'standard' ? 'K' : '°F';
  }

  function round(n) { return Math.round(n); }

  const _dayFmt  = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
  const _dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

  function dayNameFromStr(dateStr) {
    // dateStr = "2026-04-27"  (Open-Meteo format)
    const d      = new Date(dateStr + 'T12:00:00');  // noon to avoid DST edge cases
    const today  = new Date();
    const isToday = dateStr === today.toISOString().slice(0, 10);
    return isToday ? 'Today' : _dayFmt.format(d);
  }

  function shortDateFromStr(dateStr) {
    return _dateFmt.format(new Date(dateStr + 'T12:00:00'));
  }

  function dayNameFromUnix(unixSec) {
    const d      = new Date(unixSec * 1000);
    const today  = new Date();
    const isToday =
      d.getUTCFullYear() === today.getUTCFullYear() &&
      d.getUTCMonth()    === today.getUTCMonth()    &&
      d.getUTCDate()     === today.getUTCDate();
    return isToday ? 'Today' : _dayFmt.format(d);
  }

  function shortDateFromUnix(unixSec) {
    return _dateFmt.format(new Date(unixSec * 1000));
  }

  // ─── Cache ───────────────────────────────────────────────────────────────

  function saveCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch (_) {}
  }

  function loadCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (Date.now() - c.ts < CACHE_TTL_MS) return c.data;
    } catch (_) {}
    return null;
  }

  // ─── Provider: Open-Meteo ────────────────────────────────────────────────

  async function fetchOpenMeteo() {
    const { lat, lon } = CONFIG.LOCATION;
    const isMetric     = CONFIG.WEATHER_UNITS === 'metric';
    const tempUnit     = isMetric ? 'celsius' : 'fahrenheit';
    const windUnit     = isMetric ? 'kmh'     : 'mph';

    const url = [
      'https://api.open-meteo.com/v1/forecast',
      `?latitude=${lat}&longitude=${lon}`,
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature`,
      `&daily=weather_code,temperature_2m_max,temperature_2m_min`,
      `&temperature_unit=${tempUnit}`,
      `&wind_speed_unit=${windUnit}`,
      `&timezone=auto`,
      `&forecast_days=8`
    ].join('');

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const raw = await res.json();

    const sym = unitSymbol();
    const current = {
      temp:      round(raw.current.temperature_2m),
      feelsLike: round(raw.current.apparent_temperature),
      desc:      wmoDesc(raw.current.weather_code),
      icon:      wmoIconUrl(raw.current.weather_code),
      humidity:  raw.current.relative_humidity_2m,
      windSpeed: round(raw.current.wind_speed_10m),
      sym,
      provider: 'Open-Meteo'
    };

    const daily = (raw.daily.time || []).slice(0, 8).map((dateStr, i) => ({
      dt:   dateStr,
      day:  dayNameFromStr(dateStr),
      date: shortDateFromStr(dateStr),
      hi:   round(raw.daily.temperature_2m_max[i]),
      lo:   round(raw.daily.temperature_2m_min[i]),
      desc: wmoDesc(raw.daily.weather_code[i]),
      icon: wmoIconUrl(raw.daily.weather_code[i]),
      sym
    }));

    return { current, daily };
  }

  // ─── Provider: OpenWeatherMap ─────────────────────────────────────────────

  const OWM_V3  = 'https://api.openweathermap.org/data/3.0';
  const OWM_V25 = 'https://api.openweathermap.org/data/2.5';
  let _owmUsedV25 = false;

  async function fetchOWM() {
    const key = CONFIG.WEATHER_API_KEY;
    if (!key || key === 'YOUR_OPENWEATHERMAP_API_KEY') {
      throw new Error('OpenWeatherMap API key not set — edit config.js or switch to Open-Meteo');
    }

    const { lat, lon } = CONFIG.LOCATION;
    const units        = CONFIG.WEATHER_UNITS;
    const sym          = unitSymbol();

    // Try One Call 3.0 first, fall back to 2.5
    if (!_owmUsedV25) {
      try {
        const url = `${OWM_V3}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${key}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`OWM 3.0 HTTP ${res.status}`);
        const raw = await res.json();

        const current = {
          temp:      round(raw.current.temp),
          feelsLike: round(raw.current.feels_like),
          desc:      raw.current.weather[0].description,
          icon:      iconUrl(raw.current.weather[0].icon),
          humidity:  raw.current.humidity,
          windSpeed: round(raw.current.wind_speed),
          sym,
          provider: 'OpenWeatherMap'
        };
        const daily = (raw.daily || []).slice(0, 8).map(d => ({
          dt:   d.dt,
          day:  dayNameFromUnix(d.dt),
          date: shortDateFromUnix(d.dt),
          hi:   round(d.temp.max),
          lo:   round(d.temp.min),
          desc: d.weather[0].description,
          icon: iconUrl(d.weather[0].icon),
          sym
        }));
        return { current, daily };
      } catch (err) {
        console.warn('[Weather] OWM 3.0 failed, trying 2.5:', err.message);
        _owmUsedV25 = true;
      }
    }

    // 2.5 fallback: current + 5-day forecast
    const [curRes, fcRes] = await Promise.all([
      fetch(`${OWM_V25}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${key}`),
      fetch(`${OWM_V25}/forecast?lat=${lat}&lon=${lon}&units=${units}&cnt=40&appid=${key}`)
    ]);
    if (!curRes.ok) throw new Error(`OWM 2.5 HTTP ${curRes.status}`);
    const [curRaw, fcRaw] = await Promise.all([curRes.json(), fcRes.json()]);

    const current = {
      temp:      round(curRaw.main.temp),
      feelsLike: round(curRaw.main.feels_like),
      desc:      curRaw.weather[0].description,
      icon:      iconUrl(curRaw.weather[0].icon),
      humidity:  curRaw.main.humidity,
      windSpeed: round(curRaw.wind.speed),
      sym,
      provider: 'OpenWeatherMap'
    };

    // Group 3h slots into daily
    const days = {};
    for (const slot of (fcRaw.list || [])) {
      const d   = new Date(slot.dt * 1000);
      const key2 = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
      if (!days[key2]) {
        days[key2] = { dt: slot.dt, temps: [],
          icon: iconUrl(slot.weather[0].icon), desc: slot.weather[0].description, sym };
      }
      days[key2].temps.push(slot.main.temp);
      const h = d.getUTCHours();
      if (h >= 11 && h <= 13) {
        days[key2].icon = iconUrl(slot.weather[0].icon);
        days[key2].desc = slot.weather[0].description;
      }
    }
    const daily = Object.values(days).slice(0, 8).map(d => ({
      ...d,
      day:  dayNameFromUnix(d.dt),
      date: shortDateFromUnix(d.dt),
      hi:   round(Math.max(...d.temps)),
      lo:   round(Math.min(...d.temps))
    }));

    return { current, daily };
  }

  // ─── Master fetch ─────────────────────────────────────────────────────────

  async function fetchWeather() {
    const provider = CONFIG.WEATHER_PROVIDER || 'openmeteo';
    if (provider === 'owm') return fetchOWM();
    return fetchOpenMeteo();
  }

  // ─── DOM rendering ────────────────────────────────────────────────────────

  function renderHeader(current) {
    const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const el = {
      loc:   document.getElementById('weather-location-name'),
      summ:  document.getElementById('weather-current-summary'),
      upd:   document.getElementById('weather-updated')
    };
    if (el.loc)  el.loc.textContent  = CONFIG.LOCATION.name;
    if (el.summ) el.summ.textContent =
      `${current.temp}${current.sym}  ·  ${current.desc}  ·  Humidity ${current.humidity}%  ·  Wind ${current.windSpeed} ${CONFIG.WEATHER_UNITS === 'metric' ? 'km/h' : 'mph'}`;
    if (el.upd)  el.upd.textContent  =
      `${current.provider}  ·  Updated ${timeFmt.format(new Date())}`;
  }

  function renderForecast(daily) {
    const container = document.getElementById('weather-forecast');
    if (!container) return;
    container.innerHTML = daily.map((d, i) => `
      <div class="forecast-card ${i === 0 ? 'today' : ''}">
        <div class="forecast-day">${d.day}</div>
        <div class="forecast-date-label" style="font-size:1.1rem;color:var(--text-muted)">${d.date}</div>
        <img class="forecast-icon" src="${d.icon}" alt="${d.desc}"
             loading="lazy" onerror="this.style.opacity='0.3'">
        <div class="forecast-temp-hi">${d.hi}${d.sym}</div>
        <div class="forecast-temp-lo">${d.lo}${d.sym}</div>
        <div class="forecast-desc">${d.desc}</div>
      </div>
    `).join('');
  }

  function renderError(msg) {
    const c = document.getElementById('weather-forecast');
    if (c) c.innerHTML = `<div class="weather-placeholder weather-error">⚠  ${msg}</div>`;
    const l = document.getElementById('weather-location-name');
    if (l) l.textContent = CONFIG.LOCATION.name;
  }

  function shimmerIcons() {
    document.querySelectorAll('.forecast-icon').forEach(img => {
      img.classList.remove('shimmer');
      void img.offsetWidth;
      img.classList.add('shimmer');
    });
  }

  // ─── Update cycle ─────────────────────────────────────────────────────────

  let _retryCount = 0;
  const MAX_RETRIES = 5;

  async function update() {
    // Show cached data immediately while we (re-)fetch
    const cached = loadCache();
    if (cached) {
      renderHeader(cached.current);
      renderForecast(cached.daily);
      if (typeof Calendar !== 'undefined') Calendar.setWeatherData(cached.daily);
    }
    try {
      const data = await fetchWeather();
      saveCache(data);
      renderHeader(data.current);
      renderForecast(data.daily);
      // Push weather data to calendar so it can show icons on forecast days
      if (typeof Calendar !== 'undefined') Calendar.setWeatherData(data.daily);
      _retryCount = 0;
      console.log(`[Weather] Updated via ${data.current.provider}`);
    } catch (err) {
      console.error('[Weather] Fetch error:', err.message);
      _retryCount++;
      if (!cached) renderError(err.message);
      if (_retryCount < MAX_RETRIES) {
        setTimeout(update, Math.min(Math.pow(2, _retryCount) * 30000, 10 * 60 * 1000));
      }
    }
  }

  function start() {
    // Location is set from config.js (LOCATION.lat/lon/name) or overridden
    // at runtime via the TV remote settings panel (OK → Settings → Location row).
    update();
    const id = setInterval(() => { update(); shimmerIcons(); }, CONFIG.WEATHER_INTERVAL_MS);
    return id;
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  return { start, update, shimmerIcons, PROVIDERS };

})();

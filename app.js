/**
 * LG ScreenBoard — app.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Main application orchestrator.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * REMOTE CONTROL NAVIGATION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  DASHBOARD (normal view):
 *    OK / Enter   → Open Settings overlay
 *    BACK (461)   → Exit app
 *
 *  SETTINGS OVERLAY (after pressing OK):
 *    ↑ / ↓        → Move focus between rows
 *    ← / →        → Change value for focused row
 *    OK / Enter   → Toggle (clock slots) / confirm
 *    BACK         → Save all changes + close
 *
 *  Settings rows:
 *    Row 1–4  — Clock slot: toggle active, cycle timezone
 *    Row 5    — Weather API: cycle between Open-Meteo / OpenWeatherMap
 *    Row 6    — Temperature units: cycle °F / °C
 *    Row 7    — Location: cycle through cities in LOCATION_LIST (config.js)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ─── State ───────────────────────────────────────────────────────────────

  const _intervals      = {};
  let   _settingsOpen   = false;
  let   _focusedRow     = 0;

  // Settings row config
  const CLOCK_ROWS      = 4;   // Rows 0–3 = clock slots
  const ROW_WEATHER_API = 4;   // Row 4 = weather provider
  const ROW_UNITS       = 5;   // Row 5 = temperature units
  const ROW_LOCATION    = 6;   // Row 6 = location (manual override)
  const TOTAL_ROWS      = 7;

  // Storage keys
  const KEY_CLOCKS      = 'screenboard_clocks';
  const KEY_WEATHER_CFG = 'screenboard_weather_cfg';
  const KEY_LOCATION    = 'screenboard_location';

  // ─── Persistence ─────────────────────────────────────────────────────────

  function saveAll() {
    try {
      localStorage.setItem(KEY_CLOCKS, JSON.stringify(CONFIG.CLOCKS));
      localStorage.setItem(KEY_WEATHER_CFG, JSON.stringify({
        provider: CONFIG.WEATHER_PROVIDER,
        units:    CONFIG.WEATHER_UNITS
      }));
      localStorage.setItem(KEY_LOCATION, JSON.stringify(CONFIG.LOCATION));
    } catch (_) {}
  }

  function loadSaved() {
    try {
      const clocks = localStorage.getItem(KEY_CLOCKS);
      if (clocks) {
        const parsed = JSON.parse(clocks);
        if (Array.isArray(parsed) && parsed.length > 0) CONFIG.CLOCKS = parsed;
      }
    } catch (_) {}
    try {
      const wcfg = localStorage.getItem(KEY_WEATHER_CFG);
      if (wcfg) {
        const parsed = JSON.parse(wcfg);
        if (parsed.provider) CONFIG.WEATHER_PROVIDER = parsed.provider;
        if (parsed.units)    CONFIG.WEATHER_UNITS    = parsed.units;
      }
    } catch (_) {}
    try {
      const loc = localStorage.getItem(KEY_LOCATION);
      if (loc) {
        const parsed = JSON.parse(loc);
        if (parsed && parsed.lat && parsed.lon && parsed.name) CONFIG.LOCATION = parsed;
      }
    } catch (_) {}
  }

  function normaliseClocks() {
    CONFIG.CLOCKS = (CONFIG.CLOCKS || []).map(c => ({ active: true, ...c }));
    while (CONFIG.CLOCKS.length < CLOCK_ROWS) {
      const idx = CONFIG.CLOCKS.length;
      CONFIG.CLOCKS.push({
        tz:     TIMEZONE_LIST[idx % TIMEZONE_LIST.length].tz,
        label:  TIMEZONE_LIST[idx % TIMEZONE_LIST.length].label,
        flag:   TIMEZONE_LIST[idx % TIMEZONE_LIST.length].flag,
        active: false
      });
    }
  }

  // ─── Settings panel — build DOM ──────────────────────────────────────────

  function tzListIndex(tz) {
    const i = TIMEZONE_LIST.findIndex(t => t.tz === tz);
    return i >= 0 ? i : 0;
  }

  function buildSettingsRows() {
    const container = document.getElementById('settings-rows');
    if (!container) return;
    container.innerHTML = '';

    // ── Rows 0–3: clock slots ──
    CONFIG.CLOCKS.slice(0, CLOCK_ROWS).forEach((clock, i) => {
      const tzInfo = TIMEZONE_LIST[tzListIndex(clock.tz)];
      const row    = document.createElement('div');
      row.className = `settings-row${clock.active ? '' : ' inactive'}${i === _focusedRow ? ' focused' : ''}`;
      row.id = `settings-row-${i}`;
      row.innerHTML = `
        <div class="settings-slot-num">${i + 1}</div>
        <div class="settings-flag" id="sr-flag-${i}">${tzInfo.flag}</div>
        <div class="settings-arrows">
          <span class="arr">◀</span>
          <div>
            <div class="settings-tz-label" id="sr-label-${i}">${tzInfo.label}</div>
            <div class="settings-tz-id" id="sr-tzid-${i}">${clock.tz}</div>
          </div>
          <span class="arr">▶</span>
        </div>
        <div class="settings-active-badge${clock.active ? '' : ' off'}" id="sr-badge-${i}">
          ${clock.active ? '● ON' : '○ OFF'}
        </div>`;
      container.appendChild(row);
    });

    // ── Row 4: Weather API ──
    const apiRow = document.createElement('div');
    apiRow.className = `settings-row settings-row--config${_focusedRow === ROW_WEATHER_API ? ' focused' : ''}`;
    apiRow.id = `settings-row-${ROW_WEATHER_API}`;
    const providerLabel = Weather.PROVIDERS[CONFIG.WEATHER_PROVIDER]?.label || CONFIG.WEATHER_PROVIDER;
    apiRow.innerHTML = `
      <div class="settings-slot-num">☁</div>
      <div class="settings-flag">🌐</div>
      <div class="settings-arrows">
        <span class="arr">◀</span>
        <div>
          <div class="settings-tz-label" id="sr-label-${ROW_WEATHER_API}">Weather API</div>
          <div class="settings-tz-id" id="sr-tzid-${ROW_WEATHER_API}">${providerLabel}</div>
        </div>
        <span class="arr">▶</span>
      </div>
      <div class="settings-active-badge" id="sr-badge-${ROW_WEATHER_API}" style="background:rgba(74,144,217,0.15);border-color:#4A90D950">Active</div>`;
    container.appendChild(apiRow);

    // ── Row 5: Temperature units ──
    const unitsRow = document.createElement('div');
    unitsRow.className = `settings-row settings-row--config${_focusedRow === ROW_UNITS ? ' focused' : ''}`;
    unitsRow.id = `settings-row-${ROW_UNITS}`;
    const unitLabel = CONFIG.WEATHER_UNITS === 'metric' ? '°C  (Celsius)' : '°F  (Fahrenheit)';
    unitsRow.innerHTML = `
      <div class="settings-slot-num">🌡</div>
      <div class="settings-flag">  </div>
      <div class="settings-arrows">
        <span class="arr">◀</span>
        <div>
          <div class="settings-tz-label" id="sr-label-${ROW_UNITS}">Temperature Units</div>
          <div class="settings-tz-id" id="sr-tzid-${ROW_UNITS}">${unitLabel}</div>
        </div>
        <span class="arr">▶</span>
      </div>
      <div class="settings-active-badge" id="sr-badge-${ROW_UNITS}" style="background:rgba(74,144,217,0.15);border-color:#4A90D950">Active</div>`;
    container.appendChild(unitsRow);

    // ── Row 6: Location ──
    const locRow = document.createElement('div');
    locRow.className = `settings-row settings-row--config${_focusedRow === ROW_LOCATION ? ' focused' : ''}`;
    locRow.id = `settings-row-${ROW_LOCATION}`;
    locRow.innerHTML = `
      <div class="settings-slot-num">📍</div>
      <div class="settings-flag">  </div>
      <div class="settings-arrows">
        <span class="arr">◀</span>
        <div>
          <div class="settings-tz-label" id="sr-label-${ROW_LOCATION}">Location</div>
          <div class="settings-tz-id" id="sr-tzid-${ROW_LOCATION}">${CONFIG.LOCATION.name}</div>
        </div>
        <span class="arr">▶</span>
      </div>
      <div class="settings-active-badge" id="sr-badge-${ROW_LOCATION}" style="background:rgba(74,144,217,0.15);border-color:#4A90D950">Active</div>`;
    container.appendChild(locRow);
  }

  function refreshSettingsRow(rowIdx) {
    if (rowIdx < CLOCK_ROWS) {
      // Clock row
      const clock  = CONFIG.CLOCKS[rowIdx];
      if (!clock) return;
      const tzInfo = TIMEZONE_LIST[tzListIndex(clock.tz)];
      const row    = document.getElementById(`settings-row-${rowIdx}`);
      const flag   = document.getElementById(`sr-flag-${rowIdx}`);
      const label  = document.getElementById(`sr-label-${rowIdx}`);
      const tzId   = document.getElementById(`sr-tzid-${rowIdx}`);
      const badge  = document.getElementById(`sr-badge-${rowIdx}`);
      if (flag)  flag.textContent  = tzInfo.flag;
      if (label) label.textContent = tzInfo.label;
      if (tzId)  tzId.textContent  = clock.tz;
      if (badge) {
        badge.textContent = clock.active ? '● ON' : '○ OFF';
        badge.className   = `settings-active-badge${clock.active ? '' : ' off'}`;
      }
      if (row) row.className = `settings-row${clock.active ? '' : ' inactive'}${rowIdx === _focusedRow ? ' focused' : ''}`;

    } else if (rowIdx === ROW_WEATHER_API) {
      const tzId  = document.getElementById(`sr-tzid-${ROW_WEATHER_API}`);
      if (tzId) tzId.textContent = Weather.PROVIDERS[CONFIG.WEATHER_PROVIDER]?.label || CONFIG.WEATHER_PROVIDER;

    } else if (rowIdx === ROW_UNITS) {
      const tzId = document.getElementById(`sr-tzid-${ROW_UNITS}`);
      if (tzId) tzId.textContent = CONFIG.WEATHER_UNITS === 'metric' ? '°C  (Celsius)' : '°F  (Fahrenheit)';

    } else if (rowIdx === ROW_LOCATION) {
      const tzId = document.getElementById(`sr-tzid-${ROW_LOCATION}`);
      if (tzId) tzId.textContent = CONFIG.LOCATION.name;
    }
  }

  function updateFocus(prev, next) {
    const prevEl = document.getElementById(`settings-row-${prev}`);
    const nextEl = document.getElementById(`settings-row-${next}`);
    if (prevEl) prevEl.classList.remove('focused');
    if (nextEl) nextEl.classList.add('focused');
  }

  // ─── Settings open / close ────────────────────────────────────────────────

  function openSettings() {
    if (_settingsOpen) return;
    _settingsOpen = true;
    _focusedRow   = 0;
    buildSettingsRows();
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.classList.remove('settings-hidden');
  }

  function closeSettings() {
    if (!_settingsOpen) return;
    _settingsOpen = false;
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.classList.add('settings-hidden');
    saveAll();
    TimeUtils.rebuildClocks();
    // Invalidate weather cache whenever settings change (provider, units, or location may have changed)
    try { localStorage.removeItem('screenboard_weather_cache'); } catch (_) {}
    Weather.update();
    console.log('[Settings] Saved. Provider:', CONFIG.WEATHER_PROVIDER,
      '| Units:', CONFIG.WEATHER_UNITS, '| Location:', CONFIG.LOCATION.name);
  }

  // ─── Value cycling ────────────────────────────────────────────────────────

  function cycleTZ(slotIdx, dir) {
    const clock  = CONFIG.CLOCKS[slotIdx];
    if (!clock) return;
    const cur    = tzListIndex(clock.tz);
    const next   = ((cur + dir) + TIMEZONE_LIST.length) % TIMEZONE_LIST.length;
    const info   = TIMEZONE_LIST[next];
    clock.tz     = info.tz;
    clock.label  = info.label;
    clock.flag   = info.flag;
    refreshSettingsRow(slotIdx);
  }

  const PROVIDER_ORDER = ['openmeteo', 'owm'];

  function cycleWeatherProvider(dir) {
    const cur  = PROVIDER_ORDER.indexOf(CONFIG.WEATHER_PROVIDER);
    const next = ((cur + dir) + PROVIDER_ORDER.length) % PROVIDER_ORDER.length;
    CONFIG.WEATHER_PROVIDER = PROVIDER_ORDER[next];
    refreshSettingsRow(ROW_WEATHER_API);
  }

  function cycleUnits(dir) {
    const order = ['imperial', 'metric'];
    const cur   = order.indexOf(CONFIG.WEATHER_UNITS);
    const next  = ((cur + dir) + order.length) % order.length;
    CONFIG.WEATHER_UNITS = order[next];
    refreshSettingsRow(ROW_UNITS);
  }

  function locationListIndex(name) {
    const i = LOCATION_LIST.findIndex(l => l.name === name);
    return i >= 0 ? i : 0;
  }

  function cycleLocation(dir) {
    const cur  = locationListIndex(CONFIG.LOCATION.name);
    const next = ((cur + dir) + LOCATION_LIST.length) % LOCATION_LIST.length;
    CONFIG.LOCATION = { ...LOCATION_LIST[next] };
    refreshSettingsRow(ROW_LOCATION);
  }

  function toggleClockActive(slotIdx) {
    const clock       = CONFIG.CLOCKS[slotIdx];
    if (!clock) return;
    const activeCount = CONFIG.CLOCKS.filter(c => c.active).length;
    if (clock.active && activeCount <= 1) return; // Keep at least one
    clock.active = !clock.active;
    refreshSettingsRow(slotIdx);
  }

  // ─── Key handler ─────────────────────────────────────────────────────────

  function handleKey(e) {
    const key = e.keyCode || e.which;

    // Back / Exit
    if (key === 461 || key === 8 || e.key === 'GoBack' || e.key === 'BrowserBack') {
      e.preventDefault();
      if (_settingsOpen) { closeSettings(); } else { if (window.close) window.close(); }
      return;
    }

    if (!_settingsOpen) {
      if (key === 13 || e.key === 'Enter') { e.preventDefault(); openSettings(); }
      if (e.key === 'r' || e.key === 'R')  { Weather.update(); }
      return;
    }

    e.preventDefault();

    switch (key) {
      case 38: { // Up
        const p = _focusedRow;
        _focusedRow = (_focusedRow - 1 + TOTAL_ROWS) % TOTAL_ROWS;
        updateFocus(p, _focusedRow);
        break;
      }
      case 40: { // Down
        const p = _focusedRow;
        _focusedRow = (_focusedRow + 1) % TOTAL_ROWS;
        updateFocus(p, _focusedRow);
        break;
      }
      case 37: // Left ←
      case 39: { // Right →
        const dir = key === 39 ? +1 : -1;
        if (_focusedRow < CLOCK_ROWS)            cycleTZ(_focusedRow, dir);
        else if (_focusedRow === ROW_WEATHER_API) cycleWeatherProvider(dir);
        else if (_focusedRow === ROW_UNITS)       cycleUnits(dir);
        else if (_focusedRow === ROW_LOCATION)    cycleLocation(dir);
        break;
      }
      case 13: { // OK
        if (_focusedRow < CLOCK_ROWS) toggleClockActive(_focusedRow);
        break;
      }
    }
  }

  // ─── Burn-in prevention — particle layer ─────────────────────────────────

  function spawnParticles() {
    const count = CONFIG.BURN_IN_PARTICLE_COUNT || 0;
    if (!count) return;
    const layer = document.getElementById('particle-layer');
    if (!layer) return;
    layer.innerHTML = '';

    const colors = ['p-blue', 'p-white', 'p-gold', 'p-teal'];

    for (let i = 0; i < count; i++) {
      const p     = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.className = `burn-particle ${color}`;

      const size  = 8  + Math.random() * 16;   // 8–24 px  — clearly visible on a 55"
      const x     = Math.random() * 95;         // 0–95% from left edge
      const dur   = 8  + Math.random() * 14;    // 8–22 s rise time  (fast enough to notice)
      const wob   = 7  + Math.random() * 9;     // 7–16 s horizontal wobble
      const peak  = 0.25 + Math.random() * 0.30;// 0.25–0.55 peak opacity

      // Stagger start positions so bubbles appear spread out, not all at the bottom
      const riseDelay  = -(Math.random() * dur).toFixed(1);
      const wobDelay   = -(Math.random() * wob).toFixed(1);

      p.style.cssText = [
        `left:${x.toFixed(1)}%`,
        `width:${size.toFixed(1)}px`,
        `height:${size.toFixed(1)}px`,
        `--dur:${dur.toFixed(1)}s`,
        `--wob:${wob.toFixed(1)}s`,
        `--peak:${peak.toFixed(2)}`,
        `animation-delay:${riseDelay}s,${wobDelay}s`
      ].join(';');

      layer.appendChild(p);
    }
  }

  // ─── Boot ────────────────────────────────────────────────────────────────

  function hideSplash() {
    const el = document.getElementById('splash-screen');
    if (!el) return;
    el.classList.add('splash-hidden');
    setTimeout(() => { el.style.display = 'none'; }, 900);
  }

  function initSplash() {
    const ver = document.getElementById('splash-version');
    if (ver && CONFIG.VERSION) ver.textContent = 'v' + CONFIG.VERSION;
  }

  function boot() {
    console.log(`[App] LG ScreenBoard v${CONFIG.VERSION} booting`);

    initSplash();
    loadSaved();
    normaliseClocks();

    _intervals.clock    = TimeUtils.start();
    _intervals.moon     = MoonPhase.start();
    _intervals.eclipse  = EclipseModule.start();
    _intervals.calendar = Calendar.start();   // Calendar boots before weather so grid shows immediately
    _intervals.weather  = Weather.start();    // Weather detects location then fetches

    spawnParticles();                         // Burn-in: floating particle layer

    // Hide splash after 3s (covers initial data load)
    setTimeout(hideSplash, 3000);

    document.addEventListener('keydown', handleKey);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        Weather.update();
        MoonPhase.render();
        EclipseModule.render();
        Calendar.render();
      }
    });
    window.addEventListener('error', e => console.error('[App]', e.message));
    window.addEventListener('unhandledrejection', e => console.error('[App]', e.reason));

    console.log('[App] Boot complete. Provider:', CONFIG.WEATHER_PROVIDER,
      '| Active clocks:', CONFIG.CLOCKS.filter(c => c.active).map(c => c.tz).join(', '));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // ─── Debug API ───────────────────────────────────────────────────────────
  window.App = {
    version:            CONFIG.VERSION,
    openSettings,
    closeSettings,
    forceWeatherUpdate: () => Weather.update(),
    moonState:          () => MoonPhase.calculate(new Date()),
    nextSolarEclipse:   () => EclipseModule.getNextEclipse(EclipseModule.SOLAR_ECLIPSES),
    nextLunarEclipse:   () => EclipseModule.getNextEclipse(EclipseModule.LUNAR_ECLIPSES),
    clearCache:         () => {
      ['screenboard_weather_cache','screenboard_clocks','screenboard_weather_cfg']
        .forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });
      console.log('[App] All caches cleared');
    },
    currentClocks:      () => CONFIG.CLOCKS,
    currentLocation:    () => CONFIG.LOCATION,
    respawnParticles:   () => spawnParticles()
  };

})();

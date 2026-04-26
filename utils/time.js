/**
 * LG ScreenBoard — utils/time.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Dual (or up to quad) timezone clock.
 * Reads CONFIG.CLOCKS (array of {tz, label, flag, active?}) at startup.
 * Dynamically builds DOM clock blocks; runtime changes are applied by
 * calling TimeUtils.rebuildClocks() after modifying CONFIG.CLOCKS.
 *
 * Uses native Intl.DateTimeFormat — no external libraries, works offline.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const TimeUtils = (() => {

  // ─── Formatter factories ────────────────────────────────────────────────

  function makeTimeFormatter(timeZone) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour:   'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  function makeDateFormatter(timeZone) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric'
    });
  }

  // ─── Internal clock state ────────────────────────────────────────────────

  // Each entry: { tz, timeFmt, dateFmt, timeEl, dateEl }
  let _clocks = [];

  // ─── DOM builder ────────────────────────────────────────────────────────

  /**
   * Builds (or rebuilds) clock DOM blocks inside #clocks-row based on
   * the current CONFIG.CLOCKS array.
   * Called once at boot and again whenever the user changes a timezone
   * via the settings panel.
   */
  function buildClockDOM() {
    const row = document.getElementById('clocks-row');
    if (!row) return;

    // Only show active clocks (settings may have deactivated some)
    const activeClocks = (CONFIG.CLOCKS || []).filter(c => c.active !== false);
    const count = Math.min(activeClocks.length, 4);

    // Expose clock count as CSS variable so styles can adjust layout
    document.documentElement.style.setProperty('--clock-count', count);

    // Clear existing DOM
    row.innerHTML = '';
    _clocks = [];

    activeClocks.slice(0, 4).forEach((clockCfg, i) => {
      // Create DOM elements
      const block = document.createElement('div');
      block.className = 'clock-block';
      block.id = `clock-slot-${i}`;

      const label  = document.createElement('div');
      label.className = 'clock-label';
      label.textContent = `${clockCfg.flag || ''}  ${clockCfg.label || clockCfg.tz}`;

      const timeEl = document.createElement('div');
      timeEl.className = 'clock-time';
      timeEl.textContent = '──:──:── ──';

      const dateEl = document.createElement('div');
      dateEl.className = 'clock-date';
      dateEl.textContent = 'Loading…';

      block.appendChild(label);
      block.appendChild(timeEl);
      block.appendChild(dateEl);
      row.appendChild(block);

      // Add divider between clocks (not after the last one)
      if (i < count - 1) {
        const div = document.createElement('div');
        div.className = 'clock-divider';
        div.setAttribute('aria-hidden', 'true');
        row.appendChild(div);
      }

      // Store formatter references
      _clocks.push({
        tz:      clockCfg.tz,
        timeFmt: makeTimeFormatter(clockCfg.tz),
        dateFmt: makeDateFormatter(clockCfg.tz),
        timeEl,
        dateEl
      });
    });
  }

  // ─── Tick ────────────────────────────────────────────────────────────────

  /**
   * Called every CONFIG.CLOCK_INTERVAL_MS.
   * Updates all rendered clock elements with the current time.
   */
  function tick() {
    if (_clocks.length === 0) return;
    const now = new Date();
    for (const c of _clocks) {
      try {
        c.timeEl.textContent = c.timeFmt.format(now);
        c.dateEl.textContent = c.dateFmt.format(now);
      } catch (err) {
        c.timeEl.textContent = 'Error';
        console.error('[TimeUtils] tick error for', c.tz, err);
      }
    }
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Build clock DOM and start ticking.
   * Returns the interval ID.
   */
  function start() {
    buildClockDOM();
    tick(); // Immediate first render — no blank-clock flash on boot
    return setInterval(tick, CONFIG.CLOCK_INTERVAL_MS);
  }

  /**
   * Call after modifying CONFIG.CLOCKS at runtime (e.g. from settings panel).
   * Rebuilds DOM and restarts formatters.
   */
  function rebuildClocks() {
    buildClockDOM();
    tick();
  }

  return { start, tick, rebuildClocks, buildClockDOM };

})();

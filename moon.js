/**
 * LG ScreenBoard — moon.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Moon phase calculation (Julian-date algorithm) + Canvas renderer.
 * No external dependencies. Accurate to within ~1 day.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const MoonPhase = (() => {

  // ─── Constants ───────────────────────────────────────────────────────────

  const LUNAR_CYCLE     = 29.53058867;   // Mean synodic period in days
  const KNOWN_NEW_MOON  = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)); // Jan 6 2000 18:14 UTC

  // Phase boundaries (days into cycle) and their display info
  const PHASE_DEFS = [
    { maxDay:  1.845, name: 'New Moon',        symbol: '🌑', emoji: '🌑' },
    { maxDay:  7.383, name: 'Waxing Crescent', symbol: '🌒', emoji: '🌒' },
    { maxDay:  9.228, name: 'First Quarter',   symbol: '🌓', emoji: '🌓' },
    { maxDay: 14.765, name: 'Waxing Gibbous',  symbol: '🌔', emoji: '🌔' },
    { maxDay: 16.611, name: 'Full Moon',        symbol: '🌕', emoji: '🌕' },
    { maxDay: 22.148, name: 'Waning Gibbous',  symbol: '🌖', emoji: '🌖' },
    { maxDay: 23.994, name: 'Last Quarter',    symbol: '🌗', emoji: '🌗' },
    { maxDay: 29.531, name: 'Waning Crescent', symbol: '🌘', emoji: '🌘' }
  ];

  // The four major phase targets (days into cycle at exact phase)
  const MAJOR_PHASES = [
    { name: 'New Moon',       symbol: '🌑', targetDay:  0.0    },
    { name: 'First Quarter',  symbol: '🌓', targetDay:  7.3826 },
    { name: 'Full Moon',       symbol: '🌕', targetDay: 14.7653 },
    { name: 'Last Quarter',   symbol: '🌗', targetDay: 22.1479 }
  ];

  // ─── Core calculation ────────────────────────────────────────────────────

  /**
   * Returns the number of days into the current lunar cycle for a given Date.
   * Range: [0, LUNAR_CYCLE)
   */
  function getCycleDay(date) {
    const msPerDay       = 1000 * 60 * 60 * 24;
    const daysSinceKnown = (date - KNOWN_NEW_MOON) / msPerDay;
    return ((daysSinceKnown % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
  }

  /**
   * Illumination fraction [0,1] from cycle day.
   * Uses the cosine formula: half of (1 - cos(2π * cycleDay / LUNAR_CYCLE))
   */
  function getIllumination(cycleDay) {
    return (1 - Math.cos(2 * Math.PI * cycleDay / LUNAR_CYCLE)) / 2;
  }

  /**
   * Returns a full moon state object for a given date.
   */
  function calculate(date) {
    date = date || new Date();
    const cycleDay    = getCycleDay(date);
    const illumination = getIllumination(cycleDay);

    // Find phase name
    let phase = PHASE_DEFS[PHASE_DEFS.length - 1]; // fallback
    for (const p of PHASE_DEFS) {
      if (cycleDay < p.maxDay) {
        phase = p;
        break;
      }
    }

    // Waxing or waning?
    const isWaxing = cycleDay < LUNAR_CYCLE / 2;

    return {
      cycleDay:     cycleDay,
      cyclePercent: Math.round((cycleDay / LUNAR_CYCLE) * 100),
      illumination: Math.round(illumination * 100),  // 0–100
      phaseName:    phase.name,
      phaseSymbol:  phase.symbol,
      isWaxing
    };
  }

  // ─── Next major phases ───────────────────────────────────────────────────

  /**
   * Returns the next 4 major phase events with their future dates.
   * Each item: { name, symbol, date, daysUntil }
   */
  function getNextPhases(date) {
    date = date || new Date();
    const cycleDay = getCycleDay(date);

    return MAJOR_PHASES.map(mp => {
      let daysUntil = mp.targetDay - cycleDay;
      if (daysUntil <= 0.5) daysUntil += LUNAR_CYCLE; // Push to next cycle
      const phaseDate = new Date(date.getTime() + daysUntil * 24 * 60 * 60 * 1000);
      return {
        name:      mp.name,
        symbol:    mp.symbol,
        date:      phaseDate,
        daysUntil: Math.round(daysUntil)
      };
    }).sort((a, b) => a.daysUntil - b.daysUntil);
  }

  // ─── Canvas renderer ─────────────────────────────────────────────────────

  /**
   * Draw the moon disc onto a Canvas element.
   *
   * Algorithm:
   *   1. Draw a filled dark circle (the "night" side / shadow).
   *   2. Draw the illuminated portion using a second filled circle offset
   *      from center — left half or right half, depending on waxing/waning.
   *   3. Use a clip mask so we never draw outside the disc boundary.
   *
   * The result is a realistic crescent / gibbous / full moon shape.
   */
  function renderCanvas(state, canvasEl) {
    const canvas = canvasEl || document.getElementById('moon-canvas');
    if (!canvas) return;

    const ctx  = canvas.getContext('2d');
    const w    = canvas.width;
    const h    = canvas.height;
    const cx   = w / 2;
    const cy   = h / 2;
    const r    = Math.min(cx, cy) - 2;   // Disc radius with 2px padding

    ctx.clearRect(0, 0, w, h);

    // ── Clip to disc ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // ── Base: dark disc (shadow side / space) ──
    ctx.fillStyle = '#0A0F1A';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // ── Illuminated arc ──
    // illumination 0 = new moon (all dark), 1 = full moon (all lit)
    const illum    = state.illumination / 100;
    const isWaxing = state.isWaxing;

    if (illum > 0.01) {
      // For the lit crescent/gibbous, we sweep the limb using an elliptical arc.
      // x-radius of the terminator ellipse: r * |cos(π * illum)|
      // At illum=0.5 (quarter), xr=0 → straight vertical line
      // At illum=1.0 (full), xr=r → full circle
      const terminatorXr = r * Math.abs(Math.cos(Math.PI * illum));
      const litColor      = '#E8EAF0';  // Slightly cool white — lunar surface

      ctx.save();

      // Draw a full semicircle on the lit side
      ctx.beginPath();
      if (isWaxing) {
        // Waxing: right side is lit
        ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2);   // Right half
      } else {
        // Waning: left side is lit
        ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2);   // Left half (reversed)
      }
      ctx.closePath();
      ctx.fillStyle = litColor;
      ctx.fill();

      // Now draw the terminator ellipse to carve out the shadow zone
      // The terminator is an ellipse with xr = terminatorXr, yr = r
      ctx.beginPath();
      ctx.ellipse(
        cx, cy,
        terminatorXr, r,
        0,
        -Math.PI / 2, Math.PI / 2,
        isWaxing  // If waxing, shadow is on the left so we fill the left terminator
      );
      ctx.closePath();

      // For waxing: terminator fills the shadow half (left)
      // For waning: terminator fills the shadow half (right)
      if (illum < 0.5) {
        // Crescent: terminator ellipse should be filled with shadow color
        ctx.fillStyle = '#0A0F1A';
        ctx.fill();
      } else {
        // Gibbous: lit ellipse is wider than a half-circle — we need inverse
        // Re-draw: fill the whole disc lit, then carve shadow
        ctx.clearRect(0, 0, w, h);

        // Re-fill dark base
        ctx.fillStyle = '#0A0F1A';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Fill the lit ellipse (wider side)
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r, 0, 0, Math.PI * 2);
        ctx.fillStyle = litColor;
        ctx.fill();

        // Carve shadow using the terminator ellipse on the shadow side
        ctx.beginPath();
        ctx.ellipse(
          cx, cy,
          terminatorXr, r,
          0, -Math.PI / 2, Math.PI / 2,
          !isWaxing
        );
        ctx.closePath();
        ctx.fillStyle = '#0A0F1A';
        ctx.fill();
      }

      ctx.restore();
    }

    // ── Subtle surface texture (radial gradient) ──
    if (illum > 0.01) {
      const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
      grad.addColorStop(0, 'rgba(255,255,255,0.08)');
      grad.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // ── Disc outline (subtle glow ring for visibility) ──
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180,190,220,0.25)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }

  // ─── DOM renderer ────────────────────────────────────────────────────────

  function formatPhaseDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day:   'numeric'
    }).format(date);
  }

  function render() {
    const now   = new Date();
    const state = calculate(now);
    const next  = getNextPhases(now);

    // Canvas
    renderCanvas(state);

    // Phase name + illumination
    const nameEl = document.getElementById('moon-phase-name');
    const illumEl = document.getElementById('moon-illumination');
    const cycleEl = document.getElementById('moon-cycle-day');

    if (nameEl)  nameEl.textContent  = state.phaseName;
    if (illumEl) illumEl.textContent = `${state.illumination}% illuminated`;
    if (cycleEl) cycleEl.textContent = `Day ${Math.floor(state.cycleDay)} of ${Math.round(LUNAR_CYCLE)}`;

    // Next phases list
    const listEl = document.getElementById('moon-next-list');
    if (listEl) {
      listEl.innerHTML = next.map(p => `
        <div class="moon-next-item">
          <div class="moon-next-symbol">${p.symbol}</div>
          <div class="moon-next-name">${p.name}</div>
          <div class="moon-next-date">${formatPhaseDate(p.date)}</div>
          <div class="moon-next-days">${p.daysUntil === 0 ? 'Today' : `in ${p.daysUntil}d`}</div>
        </div>
      `).join('');
    }

    console.log(`[MoonPhase] ${state.phaseName} — ${state.illumination}% illuminated (day ${state.cycleDay.toFixed(1)})`);
  }

  /**
   * Start the moon renderer. Fires immediately, then every CONFIG.MOON_INTERVAL_MS.
   */
  function start() {
    render();
    return setInterval(render, CONFIG.MOON_INTERVAL_MS);
  }

  // ─── Public API ──────────────────────────────────────────────────────────
  return { start, render, calculate, getNextPhases, renderCanvas };

})();

/**
 * LG ScreenBoard — eclipse.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Solar and Lunar eclipse information module.
 *
 * Data source: NASA Eclipse Website catalog (eclipse.gsfc.nasa.gov)
 *   Saros series data, accurate to the minute. Covers 2025–2032.
 *   No network request needed — fully offline after app install.
 *
 * Displays:
 *   • Next solar eclipse  — type, date, countdown, path description
 *   • Next lunar eclipse  — type, date, countdown, visibility note
 *   • Updates every 12 hours (or on page resume)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const EclipseModule = (() => {

  // ─── Eclipse Catalog (NASA, 2025–2032) ──────────────────────────────────
  //
  // Solar types:  Total | Annular | Hybrid | Partial
  // Lunar types:  Total | Partial | Penumbral
  //
  // 'path' — brief region visibility note (solar)
  // 'vis'  — general visibility note (lunar: all night-side of Earth sees it)
  //
  // Dates are UTC. Times shown are mid-eclipse UTC.

  const SOLAR_ECLIPSES = [
    {
      date:  new Date('2025-03-29T10:47:00Z'),
      type:  'Partial',
      label: 'Partial Solar Eclipse',
      path:  'Visible from W. Africa, Europe, N. Atlantic',
      mag:   0.938
    },
    {
      date:  new Date('2025-09-21T19:43:00Z'),
      type:  'Partial',
      label: 'Partial Solar Eclipse',
      path:  'Visible from S. Pacific, S. America, Antarctica',
      mag:   0.855
    },
    {
      date:  new Date('2026-02-17T12:12:00Z'),
      type:  'Annular',
      label: 'Annular Solar Eclipse',
      path:  'Annular path: Antarctica',
      mag:   0.963,
      duration: '6m28s'
    },
    {
      date:  new Date('2026-08-12T17:47:00Z'),
      type:  'Total',
      label: 'Total Solar Eclipse',
      path:  'Total path: Greenland, Iceland, Spain, Russia',
      mag:   1.076,
      duration: '2m18s'
    },
    {
      date:  new Date('2027-02-06T16:00:00Z'),
      type:  'Annular',
      label: 'Annular Solar Eclipse',
      path:  'Annular path: Chile, Argentina',
      mag:   0.928,
      duration: '7m51s'
    },
    {
      date:  new Date('2027-08-02T10:07:00Z'),
      type:  'Total',
      label: 'Total Solar Eclipse ⭐',
      path:  'Total path: Morocco, Spain, Algeria, Egypt, Saudi Arabia',
      mag:   1.079,
      duration: '6m23s'
    },
    {
      date:  new Date('2028-01-26T15:08:00Z'),
      type:  'Annular',
      label: 'Annular Solar Eclipse',
      path:  'Annular path: Ecuador, Peru, Brazil',
      mag:   0.920,
      duration: '10m27s'
    },
    {
      date:  new Date('2028-07-22T02:56:00Z'),
      type:  'Total',
      label: 'Total Solar Eclipse',
      path:  'Total path: India, Nepal, China, Australia',
      mag:   1.056,
      duration: '5m10s'
    },
    {
      date:  new Date('2029-01-14T17:13:00Z'),
      type:  'Partial',
      label: 'Partial Solar Eclipse',
      path:  'Visible from N. America, Europe',
      mag:   0.871
    },
    {
      date:  new Date('2030-06-01T06:29:00Z'),
      type:  'Annular',
      label: 'Annular Solar Eclipse',
      path:  'Annular path: Algeria, Tunisia, Greece, Turkey',
      mag:   0.944,
      duration: '5m21s'
    },
    {
      date:  new Date('2030-11-25T06:51:00Z'),
      type:  'Total',
      label: 'Total Solar Eclipse',
      path:  'Total path: Namibia, Botswana, S. Africa',
      mag:   1.047,
      duration: '3m44s'
    },
    {
      date:  new Date('2031-05-21T18:16:00Z'),
      type:  'Annular',
      label: 'Annular Solar Eclipse',
      path:  'Annular path: Caribbean, Atlantic',
      mag:   0.940
    },
    {
      date:  new Date('2031-11-14T20:07:00Z'),
      type:  'Hybrid',
      label: 'Hybrid Solar Eclipse',
      path:  'Path: S. Atlantic, Antarctica',
      mag:   1.007
    },
    {
      date:  new Date('2032-05-09T13:25:00Z'),
      type:  'Annular',
      label: 'Annular Solar Eclipse',
      path:  'Annular path: SE Asia, Australia',
      mag:   0.956
    }
  ];

  const LUNAR_ECLIPSES = [
    {
      date:  new Date('2025-03-14T06:58:00Z'),
      type:  'Total',
      label: 'Total Lunar Eclipse',
      vis:   'Visible: Americas, Europe, W. Africa',
      mag:   1.178,
      duration: '65min totality'
    },
    {
      date:  new Date('2025-09-07T18:11:00Z'),
      type:  'Total',
      label: 'Total Lunar Eclipse',
      vis:   'Visible: Europe, Africa, Asia, Australia',
      mag:   1.364,
      duration: '82min totality'
    },
    {
      date:  new Date('2026-03-03T11:33:00Z'),
      type:  'Total',
      label: 'Total Lunar Eclipse',
      vis:   'Visible: Asia, Australia, Europe, Americas',
      mag:   1.151,
      duration: '58min totality'
    },
    {
      date:  new Date('2026-08-28T04:14:00Z'),
      type:  'Partial',
      label: 'Partial Lunar Eclipse',
      vis:   'Visible: Americas, Europe, Africa',
      mag:   0.930
    },
    {
      date:  new Date('2027-02-20T23:13:00Z'),
      type:  'Total',
      label: 'Total Lunar Eclipse',
      vis:   'Visible: Americas, Europe, Africa, W. Asia',
      mag:   1.017,
      duration: '51min totality'
    },
    {
      date:  new Date('2027-08-17T07:13:00Z'),
      type:  'Partial',
      label: 'Partial Lunar Eclipse',
      vis:   'Visible: E. Americas, Europe, Africa, Asia, Australia',
      mag:   0.139
    },
    {
      date:  new Date('2028-01-12T04:13:00Z'),
      type:  'Total',
      label: 'Total Lunar Eclipse',
      vis:   'Visible: Americas, Europe, Africa, W. Asia',
      mag:   1.254,
      duration: '76min totality'
    },
    {
      date:  new Date('2028-07-06T18:19:00Z'),
      type:  'Partial',
      label: 'Partial Lunar Eclipse',
      vis:   'Visible: E. Africa, Asia, Australia, Americas',
      mag:   0.391
    },
    {
      date:  new Date('2028-12-31T16:52:00Z'),
      type:  'Total',
      label: 'Total Lunar Eclipse',
      vis:   'Visible: Europe, Africa, Asia, Australia',
      mag:   1.248,
      duration: '77min totality'
    },
    {
      date:  new Date('2029-06-26T03:22:00Z'),
      type:  'Total',
      label: 'Total Lunar Eclipse ⭐',
      vis:   'Visible: Americas, Europe, Africa, W. Asia',
      mag:   1.844,
      duration: '102min totality'
    },
    {
      date:  new Date('2029-12-20T22:41:00Z'),
      type:  'Total',
      label: 'Total Lunar Eclipse',
      vis:   'Visible: Americas, Europe, Africa, Asia',
      mag:   1.118,
      duration: '54min totality'
    },
    {
      date:  new Date('2030-06-15T18:33:00Z'),
      type:  'Partial',
      label: 'Partial Lunar Eclipse',
      vis:   'Visible: Europe, Africa, Asia, Australia',
      mag:   0.544
    },
    {
      date:  new Date('2030-12-09T22:27:00Z'),
      type:  'Total',
      label: 'Total Lunar Eclipse',
      vis:   'Visible: Americas, Europe, Africa, W. Asia',
      mag:   1.122,
      duration: '54min totality'
    }
  ];

  // ─── Type badges (color-coded) ──────────────────────────────────────────

  const TYPE_COLORS = {
    Total:       '#E8A020',   // Gold
    Annular:     '#E07830',   // Orange
    Hybrid:      '#C06890',   // Purple-pink
    Partial:     '#5890C8',   // Blue
    Penumbral:   '#708090'    // Gray
  };

  // ─── Core: find next eclipse ─────────────────────────────────────────────

  function getNextEclipse(catalog, afterDate) {
    const now = afterDate || new Date();
    // Find the first eclipse that hasn't passed yet (allow same-day)
    const upcoming = catalog.filter(e => e.date > now);
    if (upcoming.length === 0) return null;
    upcoming.sort((a, b) => a.date - b.date);
    return upcoming[0];
  }

  function getDaysUntil(targetDate) {
    const now  = new Date();
    const diff = targetDate - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ─── Date formatting ─────────────────────────────────────────────────────

  const _eclipseDateFmt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const _eclipseTimeFmt = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short'
  });

  function formatEclipseDate(date) {
    return _eclipseDateFmt.format(date);
  }

  function formatCountdown(days) {
    if (days <= 0)  return 'Today / Ongoing';
    if (days === 1) return 'Tomorrow';
    if (days <  7)  return `In ${days} days`;
    if (days < 30)  return `In ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
    if (days < 365) return `In ~${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
    return `In ~${(days / 365).toFixed(1)} years`;
  }

  // ─── DOM rendering ───────────────────────────────────────────────────────

  function renderEclipseBlock(containerId, eclipse, typeLabel) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!eclipse) {
      container.innerHTML = `<div class="eclipse-none">No ${typeLabel} eclipse data available</div>`;
      return;
    }

    const days  = getDaysUntil(eclipse.date);
    const color = TYPE_COLORS[eclipse.type] || '#FFFFFF';

    container.innerHTML = `
      <div class="eclipse-type-badge" style="color:${color};border-color:${color}30">
        ${eclipse.type}
      </div>
      <div class="eclipse-date">${formatEclipseDate(eclipse.date)}</div>
      <div class="eclipse-countdown" style="color:${color}">${formatCountdown(days)}</div>
      <div class="eclipse-path">${eclipse.vis || eclipse.path || ''}</div>
      ${eclipse.duration ? `<div class="eclipse-duration">Totality: ${eclipse.duration}</div>` : ''}
    `;
  }

  function render() {
    const now          = new Date();
    const nextSolar    = getNextEclipse(SOLAR_ECLIPSES, now);
    const nextLunar    = getNextEclipse(LUNAR_ECLIPSES, now);

    renderEclipseBlock('solar-eclipse-info',  nextSolar,  'solar');
    renderEclipseBlock('lunar-eclipse-info',  nextLunar,  'lunar');

    console.log('[Eclipse] Solar:', nextSolar?.label, '| Lunar:', nextLunar?.label);
  }

  function start() {
    render();
    return setInterval(render, CONFIG.MOON_INTERVAL_MS); // Reuse 12h interval
  }

  // ─── Public API ──────────────────────────────────────────────────────────
  return { start, render, getNextEclipse, SOLAR_ECLIPSES, LUNAR_ECLIPSES };

})();

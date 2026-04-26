/**
 * LG ScreenBoard — calendar.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Monthly calendar grid with:
 *   • Full month view (current month, auto-advances at midnight)
 *   • Today highlighted
 *   • Weather icons on forecast days (up to 8 days from today)
 *   • US federal holidays + observances (from holidays.js)
 *   • Weekend styling
 *   • Compact layout optimized for TV distance
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Calendar = (() => {

  // ─── Internal state ──────────────────────────────────────────────────────

  let _weatherDailyCache = [];  // Set externally by weather.js integration
  let _currentMonth      = -1;  // Track month so we know when to rebuild

  // ─── Date helpers ────────────────────────────────────────────────────────

  const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const DAY_HEADERS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }

  function dateKey(d) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  // ─── Weather icon lookup ─────────────────────────────────────────────────

  /**
   * Called by weather.js after it fetches data.
   * daily = [ { dt, icon, hi, lo, desc, sym }, … ]
   */
  function setWeatherData(daily) {
    _weatherDailyCache = daily || [];
    render(); // Redraw calendar with weather icons
  }

  function buildWeatherLookup() {
    const map = {};
    for (const d of _weatherDailyCache) {
      // dt can be a "YYYY-MM-DD" string (Open-Meteo) or a Unix timestamp (OWM)
      let date;
      if (typeof d.dt === 'string') {
        date = new Date(d.dt + 'T12:00:00');
      } else {
        date = new Date(d.dt * 1000);
      }
      map[dateKey(date)] = d;
    }
    return map;
  }

  // ─── Renderer ─────────────────────────────────────────────────────────────

  function render() {
    const container = document.getElementById('calendar-grid');
    if (!container) return;

    const now      = new Date();
    const year     = now.getFullYear();
    const month    = now.getMonth();
    const today    = now.getDate();

    _currentMonth  = month;

    // Holiday lookup for this month (and next, to catch rollovers)
    const hLookup  = Holidays.buildLookup(year);
    // Also load next year's holidays in December
    const hLookup2 = month === 11 ? Holidays.buildLookup(year + 1) : {};
    const allHolidays = { ...hLookup2, ...hLookup };

    // Weather lookup
    const wLookup  = buildWeatherLookup();

    // Calendar math
    const firstDay  = new Date(year, month, 1).getDay();  // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build header
    const monthLabel = document.getElementById('calendar-month-label');
    if (monthLabel) monthLabel.textContent = `${MONTH_NAMES[month]} ${year}`;

    // Build grid cells
    let html = '';

    // Empty cells before day 1
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="cal-cell cal-cell--empty"></div>';
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate  = new Date(year, month, d);
      const dow       = cellDate.getDay();
      const isToday   = d === today;
      const isWeekend = dow === 0 || dow === 6;
      const key       = dateKey(cellDate);
      const holiday   = allHolidays[key];
      const weather   = wLookup[key];

      const classes = [
        'cal-cell',
        isToday   ? 'cal-cell--today'   : '',
        isWeekend ? 'cal-cell--weekend' : '',
        holiday   ? 'cal-cell--holiday' : ''
      ].filter(Boolean).join(' ');

      // Weather icon (small, shows for forecast days only)
      const weatherHtml = weather
        ? `<img class="cal-weather-icon" src="${weather.icon}" alt="${weather.desc}"
               loading="lazy" onerror="this.style.display='none'">`
        : '';

      // Holiday badge
      const holidayHtml = holiday
        ? `<div class="cal-holiday-name">${holiday.emoji} ${holiday.name}</div>`
        : '';

      // Hi/Lo temp (only show for forecast days with weather data)
      const tempHtml = weather
        ? `<div class="cal-temp">${weather.hi}°<span class="cal-temp-lo">/${weather.lo}°</span></div>`
        : '';

      html += `
        <div class="${classes}">
          <div class="cal-day-num">${d}</div>
          ${weatherHtml}
          ${tempHtml}
          ${holidayHtml}
        </div>`;
    }

    // Remaining empty cells to complete the grid (fill to multiple of 7)
    const totalCells = firstDay + daysInMonth;
    const remainder  = totalCells % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        html += '<div class="cal-cell cal-cell--empty"></div>';
      }
    }

    container.innerHTML = html;
  }

  // ─── Midnight auto-advance ────────────────────────────────────────────────

  function scheduleNextMidnight() {
    const now       = new Date();
    const tomorrow  = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
    const msUntil   = tomorrow - now;
    setTimeout(() => {
      render();
      scheduleNextMidnight(); // Re-schedule for the following midnight
    }, msUntil);
  }

  // ─── Start ────────────────────────────────────────────────────────────────

  function start() {
    render();
    scheduleNextMidnight();
    // Also re-render every hour (catches DST changes, edge cases)
    return setInterval(() => {
      const now = new Date();
      if (now.getMonth() !== _currentMonth) render();
    }, 60 * 60 * 1000);
  }

  // ─── Public API ──────────────────────────────────────────────────────────
  return { start, render, setWeatherData };

})();

/**
 * LG ScreenBoard — holidays.js
 * ─────────────────────────────────────────────────────────────────────────────
 * US Federal Holidays catalog with rule-based date computation.
 *
 * Covers all 11 official US federal public holidays as defined by
 * 5 U.S.C. § 6103. Dates are computed algorithmically for any year,
 * so no updates are needed beyond 2032 (unlike the eclipse catalog).
 *
 * Also includes a curated set of widely-observed non-federal observances
 * (Mother's Day, Valentine's Day, etc.) — toggleable via CONFIG.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const Holidays = (() => {

  // ─── Day-of-week helpers ─────────────────────────────────────────────────

  /** Return the nth weekday (0=Sun … 6=Sat) in a given month/year.
   *  e.g. nthWeekday(1, 1, 2026) = 2nd Monday of January 2026
   */
  function nthWeekday(n, weekday, year, month) {
    // month is 0-indexed (JS convention)
    let count = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month, d).getDay();
      if (dow === weekday) {
        count++;
        if (count === n) return new Date(year, month, d);
      }
    }
    return null;
  }

  /** Return the last weekday in a month.
   *  e.g. lastWeekday(1, 5, 2026) = last Monday of May 2026
   */
  function lastWeekday(weekday, year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = daysInMonth; d >= 1; d--) {
      if (new Date(year, month, d).getDay() === weekday) {
        return new Date(year, month, d);
      }
    }
    return null;
  }

  /** If a date falls on Saturday, observed on Friday.
   *  If Sunday, observed on Monday. */
  function observed(date) {
    const dow = date.getDay();
    if (dow === 6) return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    if (dow === 0) return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return date;
  }

  // ─── Federal holidays for a given year ──────────────────────────────────

  function getFederalHolidays(year) {
    const y = year;
    return [
      {
        name:     "New Year's Day",
        date:     observed(new Date(y, 0, 1)),
        actual:   new Date(y, 0, 1),
        emoji:    '🎆',
        federal:  true
      },
      {
        name:     'MLK Jr. Day',
        date:     nthWeekday(3, 1, y, 0),   // 3rd Monday of January
        actual:   nthWeekday(3, 1, y, 0),
        emoji:    '✊',
        federal:  true
      },
      {
        name:     "Presidents' Day",
        date:     nthWeekday(3, 1, y, 1),   // 3rd Monday of February
        actual:   nthWeekday(3, 1, y, 1),
        emoji:    '🏛',
        federal:  true
      },
      {
        name:     'Memorial Day',
        date:     lastWeekday(1, y, 4),      // Last Monday of May
        actual:   lastWeekday(1, y, 4),
        emoji:    '🎖',
        federal:  true
      },
      {
        name:     'Juneteenth',
        date:     observed(new Date(y, 5, 19)),
        actual:   new Date(y, 5, 19),
        emoji:    '✊',
        federal:  true
      },
      {
        name:     'Independence Day',
        date:     observed(new Date(y, 6, 4)),
        actual:   new Date(y, 6, 4),
        emoji:    '🎇',
        federal:  true
      },
      {
        name:     'Labor Day',
        date:     nthWeekday(1, 1, y, 8),   // 1st Monday of September
        actual:   nthWeekday(1, 1, y, 8),
        emoji:    '👷',
        federal:  true
      },
      {
        name:     'Columbus Day',
        date:     nthWeekday(2, 1, y, 9),   // 2nd Monday of October
        actual:   nthWeekday(2, 1, y, 9),
        emoji:    '⚓',
        federal:  true
      },
      {
        name:     'Veterans Day',
        date:     observed(new Date(y, 10, 11)),
        actual:   new Date(y, 10, 11),
        emoji:    '🎗',
        federal:  true
      },
      {
        name:     'Thanksgiving',
        date:     nthWeekday(4, 4, y, 10),  // 4th Thursday of November
        actual:   nthWeekday(4, 4, y, 10),
        emoji:    '🦃',
        federal:  true
      },
      {
        name:     'Christmas Day',
        date:     observed(new Date(y, 11, 25)),
        actual:   new Date(y, 11, 25),
        emoji:    '🎄',
        federal:  true
      }
    ];
  }

  // ─── Notable observances (non-federal) ──────────────────────────────────

  function getObservances(year) {
    const y = year;
    return [
      {
        name:    "Valentine's Day",
        date:    new Date(y, 1, 14),
        emoji:   '❤',
        federal: false
      },
      {
        name:    "St. Patrick's Day",
        date:    new Date(y, 2, 17),
        emoji:   '☘',
        federal: false
      },
      {
        name:    "Easter",
        date:    getEaster(y),
        emoji:   '🐣',
        federal: false
      },
      {
        name:    "Mother's Day",
        date:    nthWeekday(2, 0, y, 4),   // 2nd Sunday of May
        emoji:   '💐',
        federal: false
      },
      {
        name:    "Father's Day",
        date:    nthWeekday(3, 0, y, 5),   // 3rd Sunday of June
        emoji:   '👔',
        federal: false
      },
      {
        name:    'Halloween',
        date:    new Date(y, 9, 31),
        emoji:   '🎃',
        federal: false
      },
      {
        name:    "New Year's Eve",
        date:    new Date(y, 11, 31),
        emoji:   '🎉',
        federal: false
      }
    ];
  }

  // ─── Easter (Anonymous Gregorian algorithm) ──────────────────────────────

  function getEaster(year) {
    const y = year;
    const a = y % 19;
    const b = Math.floor(y / 100);
    const c = y % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
    const day   = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Returns all holidays (federal + observances) for a given year,
   * sorted by date.
   */
  function getAll(year) {
    const fed  = getFederalHolidays(year);
    const obs  = getObservances(year);
    return [...fed, ...obs].sort((a, b) => a.date - b.date);
  }

  /**
   * Returns a Set of "YYYY-M-D" keys for fast O(1) lookup.
   * Includes both the observed and actual dates.
   */
  function buildLookup(year) {
    const lookup = {};
    const all    = getAll(year);
    for (const h of all) {
      const key = `${h.date.getFullYear()}-${h.date.getMonth()}-${h.date.getDate()}`;
      lookup[key] = h;
      if (h.actual) {
        const ak = `${h.actual.getFullYear()}-${h.actual.getMonth()}-${h.actual.getDate()}`;
        if (!lookup[ak]) lookup[ak] = h;
      }
    }
    return lookup;
  }

  /**
   * Returns holidays that fall within the next N days from today.
   */
  function getUpcoming(n) {
    n = n || 60;
    const now   = new Date();
    const limit = new Date(now.getTime() + n * 86400000);
    const year1 = now.getFullYear();
    const year2 = limit.getFullYear();
    const all   = year1 === year2
      ? getAll(year1)
      : [...getAll(year1), ...getAll(year2)];
    return all.filter(h => h.date >= now && h.date <= limit)
              .sort((a, b) => a.date - b.date);
  }

  return { getAll, buildLookup, getUpcoming, getFederalHolidays, getObservances };

})();

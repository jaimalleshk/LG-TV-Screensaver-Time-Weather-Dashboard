/**
 * LG ScreenBoard — Central Configuration
 * ──────────────────────────────────────────────────────────────────────────────
 * Edit this file to set your API key, location, and default time zones.
 *
 * Time zones can also be changed at runtime using the remote control:
 *   Press OK / Enter on the TV remote → Settings overlay opens
 *   Use ↑↓ to move between clock slots, ←→ to cycle through time zones.
 *   Changes are saved automatically to the TV's local storage.
 *
 * Do NOT commit a real API key to version control.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const CONFIG = {

  // ─── Weather Provider ─────────────────────────────────────────────────────
  // 'openmeteo' — DEFAULT. Free, no API key, global coverage, 8-day forecast.
  //               Switch to it at any time, even without an OWM key.
  // 'owm'       — OpenWeatherMap. Requires WEATHER_API_KEY below.
  //               Get a free key at: https://openweathermap.org/api
  //
  // You can also change this at runtime via the remote settings panel
  // (press OK on the TV remote → Settings → Weather API row).
  WEATHER_PROVIDER: 'openmeteo',

  // OpenWeatherMap API key (only needed if WEATHER_PROVIDER is 'owm')
  WEATHER_API_KEY: 'YOUR_OPENWEATHERMAP_API_KEY',

  // Your location (used for weather + moon/eclipse accuracy).
  // Change this to your city, or use the TV remote at runtime:
  //   Press OK → Settings → navigate to the Location row → ←→ to pick a city.
  // Changes made via the remote are saved automatically to local storage.
  LOCATION: {
    lat:  30.0972,
    lon: -95.6167,
    name: 'Tomball, TX'   // Displayed in the weather header
  },

  // 'imperial' = °F  |  'metric' = °C
  WEATHER_UNITS: 'imperial',

  // ─── Clocks (1–4 supported) ───────────────────────────────────────────────
  // Each entry: { tz, label, flag }
  //   tz    — IANA timezone string (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
  //   label — Short name shown above the clock
  //   flag  — Emoji flag for visual identification
  //
  // Remove entries or add up to 4 total.
  // Runtime editing is available via the remote-control settings panel.
  CLOCKS: [
    { tz: 'America/Chicago', label: 'Central Time',  flag: '🇺🇸' },
    { tz: 'Europe/London',   label: 'London (GMT)',  flag: '🇬🇧' },
    { tz: 'Asia/Kolkata',    label: 'India (IST)',   flag: '🇮🇳' }
    // Add a 4th if needed, e.g.:
    // { tz: 'Asia/Tokyo', label: 'Tokyo (JST)', flag: '🇯🇵' },
  ],

  // ─── Refresh Intervals ───────────────────────────────────────────────────
  CLOCK_INTERVAL_MS:     1000,                // 1 second
  WEATHER_INTERVAL_MS:   30 * 60 * 1000,      // 30 minutes
  MOON_INTERVAL_MS:      12 * 60 * 60 * 1000, // 12 hours

  // ─── Burn-In Prevention ──────────────────────────────────────────────────
  // Burn-in is handled by CSS particle/fade animations — no layout shifting.
  BURN_IN_PARTICLE_COUNT: 25,         // Floating bubble count (increase for more churn, 0 = disable)

  // ─── App Meta ────────────────────────────────────────────────────────────
  VERSION: '1.0.0'
};

// ─── Available Locations (used by the remote settings panel) ─────────────────
// Add your own cities here. The app will use geolocation automatically when
// possible; this list is a manual override for when geolocation is unavailable.
// Format: { lat, lon, name }  — name is displayed in the weather header.
const LOCATION_LIST = [
  { lat:  30.0972, lon: -95.6167, name: 'Tomball, TX'       },
  { lat:  29.7604, lon: -95.3698, name: 'Houston, TX'       },
  { lat:  30.2672, lon: -97.7431, name: 'Austin, TX'        },
  { lat:  32.7767, lon: -96.7970, name: 'Dallas, TX'        },
  { lat:  29.4241, lon: -98.4936, name: 'San Antonio, TX'   },
  { lat:  40.7128, lon: -74.0060, name: 'New York, NY'      },
  { lat:  34.0522, lon:-118.2437, name: 'Los Angeles, CA'   },
  { lat:  41.8781, lon: -87.6298, name: 'Chicago, IL'       },
  { lat:  33.4484, lon:-112.0740, name: 'Phoenix, AZ'       },
  { lat:  29.9511, lon: -90.0715, name: 'New Orleans, LA'   },
  { lat:  47.6062, lon:-122.3321, name: 'Seattle, WA'       },
  { lat:  37.7749, lon:-122.4194, name: 'San Francisco, CA' },
  { lat:  39.7392, lon:-104.9903, name: 'Denver, CO'        },
  { lat:  25.7617, lon: -80.1918, name: 'Miami, FL'         },
  { lat:  33.7490, lon: -84.3880, name: 'Atlanta, GA'       },
  { lat:  42.3601, lon: -71.0589, name: 'Boston, MA'        },
  { lat:  51.5074, lon:  -0.1278, name: 'London, UK'        },
  { lat:  48.8566, lon:   2.3522, name: 'Paris, France'     },
  { lat:  28.6139, lon:  77.2090, name: 'New Delhi, India'  },
  { lat:  19.0760, lon:  72.8777, name: 'Mumbai, India'     },
  { lat:  35.6762, lon: 139.6503, name: 'Tokyo, Japan'      },
  { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia' },
  { lat:  43.6532, lon: -79.3832, name: 'Toronto, Canada'   },
  { lat:  -23.5505, lon:-46.6333, name: 'São Paulo, Brazil' }
];

// ─── Available Time Zones (used by the remote settings panel) ────────────────
// Add, remove, or reorder entries to control what the remote settings offers.
const TIMEZONE_LIST = [
  { tz: 'America/New_York',    label: 'Eastern (ET)',         flag: '🇺🇸' },
  { tz: 'America/Chicago',     label: 'Central (CT)',         flag: '🇺🇸' },
  { tz: 'America/Denver',      label: 'Mountain (MT)',        flag: '🇺🇸' },
  { tz: 'America/Los_Angeles', label: 'Pacific (PT)',         flag: '🇺🇸' },
  { tz: 'America/Anchorage',   label: 'Alaska (AKT)',         flag: '🇺🇸' },
  { tz: 'Pacific/Honolulu',    label: 'Hawaii (HST)',         flag: '🇺🇸' },
  { tz: 'America/Toronto',     label: 'Toronto (ET)',         flag: '🇨🇦' },
  { tz: 'America/Vancouver',   label: 'Vancouver (PT)',       flag: '🇨🇦' },
  { tz: 'America/Sao_Paulo',   label: 'Sao Paulo (BRT)',      flag: '🇧🇷' },
  { tz: 'Europe/London',       label: 'London (GMT/BST)',     flag: '🇬🇧' },
  { tz: 'Europe/Paris',        label: 'Paris (CET/CEST)',     flag: '🇫🇷' },
  { tz: 'Europe/Berlin',       label: 'Berlin (CET/CEST)',    flag: '🇩🇪' },
  { tz: 'Europe/Rome',         label: 'Rome (CET/CEST)',      flag: '🇮🇹' },
  { tz: 'Europe/Moscow',       label: 'Moscow (MSK)',         flag: '🇷🇺' },
  { tz: 'Africa/Cairo',        label: 'Cairo (EET)',          flag: '🇪🇬' },
  { tz: 'Africa/Johannesburg', label: 'Johannesburg (SAST)',  flag: '🇿🇦' },
  { tz: 'Asia/Dubai',          label: 'Dubai (GST)',          flag: '🇦🇪' },
  { tz: 'Asia/Karachi',        label: 'Karachi (PKT)',        flag: '🇵🇰' },
  { tz: 'Asia/Kolkata',        label: 'India (IST)',          flag: '🇮🇳' },
  { tz: 'Asia/Dhaka',          label: 'Dhaka (BST)',          flag: '🇧🇩' },
  { tz: 'Asia/Bangkok',        label: 'Bangkok (ICT)',        flag: '🇹🇭' },
  { tz: 'Asia/Singapore',      label: 'Singapore (SGT)',      flag: '🇸🇬' },
  { tz: 'Asia/Shanghai',       label: 'Shanghai (CST)',       flag: '🇨🇳' },
  { tz: 'Asia/Hong_Kong',      label: 'Hong Kong (HKT)',      flag: '🇭🇰' },
  { tz: 'Asia/Tokyo',          label: 'Tokyo (JST)',          flag: '🇯🇵' },
  { tz: 'Asia/Seoul',          label: 'Seoul (KST)',          flag: '🇰🇷' },
  { tz: 'Australia/Sydney',    label: 'Sydney (AEDT/AEST)',   flag: '🇦🇺' },
  { tz: 'Australia/Perth',     label: 'Perth (AWST)',         flag: '🇦🇺' },
  { tz: 'Pacific/Auckland',    label: 'Auckland (NZST)',      flag: '🇳🇿' },
  { tz: 'UTC',                 label: 'UTC',                  flag: '🌐' }
];

/* ==========================================================================
   AgriPulse — data.js
   --------------------------------------------------------------------------
   ALL demo data lives here. Nothing in this file touches the DOM.
   Later, replace these objects with real API responses and the rest of the
   app keeps working.

   Everything below is SIMULATED DATA for a prototype demo.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Crops and markets
   -------------------------------------------------------------------------- */

const CROPS = [
  { id: 'tomato',  name: 'Tomato',  unit: 'quintal' },
  { id: 'onion',   name: 'Onion',   unit: 'quintal' },
  { id: 'soybean', name: 'Soybean', unit: 'quintal' },
  { id: 'cotton',  name: 'Cotton',  unit: 'quintal' }
];

// mapX / mapY are positions on the stylised SVG map (600 x 400 viewBox).
// labelDir keeps the price labels from overlapping each other.
const MARKETS = [
  { id: 'nagpur', name: 'Nagpur', state: 'Maharashtra', mapX: 405, mapY: 110, labelDir: 'up' },
  { id: 'nashik', name: 'Nashik', state: 'Maharashtra', mapX: 168, mapY: 150, labelDir: 'up' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', mapX: 108, mapY: 222, labelDir: 'down' },
  { id: 'pune',   name: 'Pune',   state: 'Maharashtra', mapX: 200, mapY: 272, labelDir: 'down' }
];

/* --------------------------------------------------------------------------
   2. Market data — one entry per crop + market
   --------------------------------------------------------------------------
   currentPrice ....... today's mandi price (₹ / quintal)
   forecastLow/High ... 7-day forecast band
   forecastMid ........ single-number forecast used in the comparison table
   baseline ........... starting point for the What-If simulator
   confidence ......... 0-100, how reliable the forecast is estimated to be
   recommendation ..... "WAIT" or "SELL"
   -------------------------------------------------------------------------- */

const MARKET_DATA = {
  tomato: {
    nagpur: {
      currentPrice: 2800, forecastLow: 2950, forecastHigh: 3150, forecastMid: 3050,
      baseline: 2950, confidence: 78, recommendation: 'WAIT',
      note: 'Prices are expected to rise moderately over the next 7 days based on current market signals.',
      signals: { supply: 38, demand: 67, weather: 'Moderate', momentum: 8.4 }
    },
    pune: {
      currentPrice: 3050, forecastLow: 3100, forecastHigh: 3260, forecastMid: 3180,
      baseline: 3100, confidence: 74, recommendation: 'WAIT',
      note: 'Demand is holding firm while arrivals stay slightly below the seasonal average.',
      signals: { supply: 44, demand: 63, weather: 'Moderate', momentum: 5.1 }
    },
    nashik: {
      currentPrice: 3120, forecastLow: 3180, forecastHigh: 3320, forecastMid: 3250,
      baseline: 3180, confidence: 71, recommendation: 'SELL',
      note: 'Prices are already near the recent high and fresh arrivals are picking up.',
      signals: { supply: 61, demand: 58, weather: 'Low', momentum: 3.2 }
    },
    mumbai: {
      currentPrice: 3350, forecastLow: 3350, forecastHigh: 3490, forecastMid: 3420,
      baseline: 3350, confidence: 69, recommendation: 'SELL',
      note: 'The market is close to its ceiling for this season; further upside looks limited.',
      signals: { supply: 57, demand: 71, weather: 'Low', momentum: 2.1 }
    }
  },

  onion: {
    nagpur: {
      currentPrice: 1720, forecastLow: 1660, forecastHigh: 1780, forecastMid: 1720,
      baseline: 1660, confidence: 65, recommendation: 'SELL',
      note: 'Storage stock is entering the market and is expected to cap prices this week.',
      signals: { supply: 72, demand: 49, weather: 'Low', momentum: -2.6 }
    },
    pune: {
      currentPrice: 1880, forecastLow: 1900, forecastHigh: 2010, forecastMid: 1955,
      baseline: 1900, confidence: 70, recommendation: 'WAIT',
      note: 'Trade enquiry has improved while daily arrivals stay flat.',
      signals: { supply: 46, demand: 64, weather: 'Moderate', momentum: 4.4 }
    },
    nashik: {
      currentPrice: 1950, forecastLow: 2010, forecastHigh: 2140, forecastMid: 2075,
      baseline: 2010, confidence: 76, recommendation: 'WAIT',
      note: 'Export enquiry from the Lasalgaon belt has strengthened over the last fortnight.',
      signals: { supply: 35, demand: 74, weather: 'Moderate', momentum: 7.9 }
    },
    mumbai: {
      currentPrice: 2100, forecastLow: 2080, forecastHigh: 2180, forecastMid: 2130,
      baseline: 2080, confidence: 63, recommendation: 'SELL',
      note: 'Retail offtake is steady but wholesale margins are already stretched.',
      signals: { supply: 59, demand: 56, weather: 'Low', momentum: 1.4 }
    }
  },

  soybean: {
    nagpur: {
      currentPrice: 4650, forecastLow: 4700, forecastHigh: 4860, forecastMid: 4780,
      baseline: 4700, confidence: 81, recommendation: 'WAIT',
      note: 'Crushing demand is firm and mandi arrivals have thinned out this week.',
      signals: { supply: 41, demand: 70, weather: 'Moderate', momentum: 3.8 }
    },
    pune: {
      currentPrice: 4720, forecastLow: 4690, forecastHigh: 4820, forecastMid: 4755,
      baseline: 4690, confidence: 72, recommendation: 'SELL',
      note: 'Local crushers are well stocked, so near-term upside looks thin.',
      signals: { supply: 55, demand: 52, weather: 'Low', momentum: 0.9 }
    },
    nashik: {
      currentPrice: 4580, forecastLow: 4620, forecastHigh: 4740, forecastMid: 4680,
      baseline: 4620, confidence: 74, recommendation: 'WAIT',
      note: 'Prices are tracking the Nagpur benchmark with a short lag.',
      signals: { supply: 48, demand: 61, weather: 'Moderate', momentum: 2.7 }
    },
    mumbai: {
      currentPrice: 4890, forecastLow: 4900, forecastHigh: 5040, forecastMid: 4970,
      baseline: 4900, confidence: 77, recommendation: 'WAIT',
      note: 'Port-side meal demand is supporting the market.',
      signals: { supply: 43, demand: 68, weather: 'Low', momentum: 4.6 }
    }
  },

  cotton: {
    nagpur: {
      currentPrice: 7480, forecastLow: 7520, forecastHigh: 7700, forecastMid: 7610,
      baseline: 7520, confidence: 75, recommendation: 'WAIT',
      note: 'Ginning demand has picked up ahead of the export shipping window.',
      signals: { supply: 40, demand: 66, weather: 'Moderate', momentum: 3.1 }
    },
    pune: {
      currentPrice: 7550, forecastLow: 7500, forecastHigh: 7640, forecastMid: 7570,
      baseline: 7500, confidence: 66, recommendation: 'SELL',
      note: 'Mill buying has slowed and the market is trading sideways.',
      signals: { supply: 58, demand: 51, weather: 'Low', momentum: 0.4 }
    },
    nashik: {
      currentPrice: 7390, forecastLow: 7430, forecastHigh: 7580, forecastMid: 7505,
      baseline: 7430, confidence: 70, recommendation: 'WAIT',
      note: 'Quality lots are attracting a premium as fresh supply tightens.',
      signals: { supply: 45, demand: 62, weather: 'Moderate', momentum: 2.5 }
    },
    mumbai: {
      currentPrice: 7820, forecastLow: 7800, forecastHigh: 7930, forecastMid: 7865,
      baseline: 7800, confidence: 68, recommendation: 'SELL',
      note: 'Export parity is tight at current levels, limiting further gains.',
      signals: { supply: 54, demand: 59, weather: 'Low', momentum: 1.2 }
    }
  }
};

/* --------------------------------------------------------------------------
   3. Ranked factors behind the forecast (Section: Why this forecast?)
   -------------------------------------------------------------------------- */

const FORECAST_FACTORS = [
  { id: 'arrivals', label: 'Market arrivals',      direction: 'down', impact: 'High',     weight: 86, note: 'Fewer arrivals mean less competition among sellers.' },
  { id: 'momentum', label: 'Recent price momentum', direction: 'up',   impact: 'High',     weight: 78, note: 'Prices have moved up steadily over the last seven sessions.' },
  { id: 'export',   label: 'Export activity',       direction: 'up',   impact: 'Moderate', weight: 54, note: 'Outbound trade enquiry has improved month on month.' },
  { id: 'weather',  label: 'Weather conditions',    direction: 'flat', impact: 'Moderate', weight: 47, note: 'Forecast rainfall may slow the movement of produce to the mandi.' }
];

/* --------------------------------------------------------------------------
   4. Market insights (Section: Insights)
   -------------------------------------------------------------------------- */

const INSIGHTS = [
  { id: 'momentum', title: 'Market momentum', text: 'Tomato prices have increased across several selected Maharashtra markets.' },
  { id: 'supply',   title: 'Supply signal',   text: 'Market arrivals are currently below the recent average.' },
  { id: 'weather',  title: 'Weather signal',  text: 'Expected rainfall may affect near-term market arrivals.' },
  { id: 'trade',    title: 'Trade signal',    text: 'Export activity is showing positive momentum.' }
];

/* --------------------------------------------------------------------------
   5. How it works + roadmap
   -------------------------------------------------------------------------- */

const PIPELINE = [
  { step: 'Collect',   title: 'Collect',   text: 'Market prices, arrivals, weather and trade indicators.' },
  { step: 'Analyze',   title: 'Analyze',   text: 'Combine historical trends and current market signals.' },
  { step: 'Forecast',  title: 'Forecast',  text: 'Estimate the likely short-term price range.' },
  { step: 'Recommend', title: 'Recommend', text: 'Help the farmer decide whether to sell now or wait.' }
];

const ROADMAP = [
  { phase: 'Phase 1', title: 'Maharashtra pilot',                 text: 'Four mandis, four crops, one clear decision per farmer.' },
  { phase: 'Phase 2', title: 'India-wide crop and market coverage', text: 'Expand to national mandi coverage across major commodities.' },
  { phase: 'Phase 3', title: 'Global agricultural intelligence',   text: 'Add international benchmarks and export price signals.' },
  { phase: 'Phase 4', title: 'Personalised recommendations',       text: 'Tune advice to a farmer\'s own volume, storage and costs.' }
];

/* --------------------------------------------------------------------------
   6. Price history generator
   --------------------------------------------------------------------------
   We do not have a real price database, so we build a stable, believable
   price series from the current price. The same crop + market always
   produces the same chart (no flickering between page loads).
   -------------------------------------------------------------------------- */

// Small seeded random-number generator (mulberry32).
function makeRandom(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromText(text) {
  let sum = 17;
  for (let i = 0; i < text.length; i++) sum += text.charCodeAt(i) * (i + 3);
  return sum * 9301 + 49297;
}

function dateOffset(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

const HISTORY_DAYS = 90;
const FORECAST_DAYS = 7;

/**
 * Builds 90 days of history ending at today's current price.
 *
 * The shape is built from two anchors so the chart always agrees with the
 * numbers shown elsewhere on the page:
 *   - day -7  = the price implied by the market's 7-day momentum
 *   - day  0  = today's current price
 * A small amount of stable noise is layered on top so it looks like real
 * mandi data instead of a straight line.
 *
 * Returns [{ date, price }] oldest first.
 */
function buildHistory(cropId, marketId) {
  const info = MARKET_DATA[cropId][marketId];
  const rand = makeRandom(seedFromText(cropId + '-' + marketId));
  const current = info.currentPrice;

  const last = HISTORY_DAYS - 1;          // index of today
  const weekAgoIndex = last - 7;          // index of the day 7 days ago
  const weekAgoPrice = current / (1 + info.signals.momentum / 100);
  const startPrice = current * 0.9;       // roughly 10% lower three months back

  const points = [];
  for (let i = 0; i < HISTORY_DAYS; i++) {
    let trend;
    if (i <= weekAgoIndex) {
      // Long stretch: startPrice climbing to the price of one week ago.
      const t = i / weekAgoIndex;
      trend = startPrice + (weekAgoPrice - startPrice) * (t * t * 0.45 + t * 0.55);
    } else {
      // Last week: move from the week-ago price to today's price.
      const t = (i - weekAgoIndex) / 7;
      trend = weekAgoPrice + (current - weekAgoPrice) * t;
    }

    // Stable wiggle, forced to zero on the two anchor days.
    const wiggle = ((rand() - 0.5) * 0.018 + Math.sin(i / 7.5) * 0.006) * current;
    const onAnchor = (i === last || i === weekAgoIndex);

    points.push({
      date: dateOffset(-(last - i)),
      price: Math.round(onAnchor ? trend : trend + wiggle)
    });
  }
  return points;
}

/**
 * Builds the 7-day forecast cone.
 * Returns [{ date, low, mid, high }] starting from tomorrow.
 */
function buildForecast(cropId, marketId) {
  const info = MARKET_DATA[cropId][marketId];
  const current = info.currentPrice;
  const halfBand = (info.forecastHigh - info.forecastLow) / 2;
  const out = [];

  for (let t = 1; t <= FORECAST_DAYS; t++) {
    const frac = t / FORECAST_DAYS;
    const mid = current + (info.forecastMid - current) * frac;
    const spread = halfBand * (0.3 + 0.7 * frac);
    out.push({
      date: dateOffset(t),
      low: Math.round(mid - spread),
      mid: Math.round(mid),
      high: Math.round(mid + spread)
    });
  }
  return out;
}

/* --------------------------------------------------------------------------
   7. Small helpers used across the app
   -------------------------------------------------------------------------- */

function formatRupees(value) {
  return '₹' + Math.round(value).toLocaleString('en-IN');
}

function formatPercent(value) {
  return (value >= 0 ? '+' : '') + (Math.round(value * 10) / 10).toFixed(1) + '%';
}

/** Whole-number version, used for the simulator sliders. */
function formatPercentWhole(value) {
  return (value >= 0 ? '+' : '') + Math.round(value) + '%';
}

function getCrop(cropId) {
  return CROPS.find(function (c) { return c.id === cropId; });
}

function getMarket(marketId) {
  return MARKETS.find(function (m) { return m.id === marketId; });
}

function getMarketData(cropId, marketId) {
  return MARKET_DATA[cropId][marketId];
}

/** Expected change between today's price and the mid forecast, in percent. */
function expectedChangePct(cropId, marketId) {
  const info = getMarketData(cropId, marketId);
  return ((info.forecastMid - info.currentPrice) / info.currentPrice) * 100;
}

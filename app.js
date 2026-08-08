/* ==========================================================================
   AgriPulse — app.js
   --------------------------------------------------------------------------
   Connects the demo data (data.js) to the page.
   Pattern used everywhere: change `state`, then call render().
   ========================================================================== */

/* Shorthand helpers */
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }

/* --------------------------------------------------------------------------
   Application state — the only thing that changes
   -------------------------------------------------------------------------- */
const state = {
  cropId: 'tomato',
  marketId: 'nagpur',
  rangeDays: 90,
  mapMarketId: 'nagpur',
  scenario: { supply: 0, demand: 0, exports: 0, rainfall: 'normal' }
};

/* Cached series so we do not rebuild them on every hover/redraw */
let priceHistory = [];
let priceForecast = [];

/* ==========================================================================
   RENDER: MARKET SELECTOR
   ========================================================================== */
function buildSelectors() {
  const cropSelect = $('#cropSelect');
  const marketSelect = $('#marketSelect');

  CROPS.forEach(function (crop) {
    const opt = document.createElement('option');
    opt.value = crop.id;
    opt.textContent = crop.name;
    cropSelect.appendChild(opt);
  });

  MARKETS.forEach(function (market) {
    const opt = document.createElement('option');
    opt.value = market.id;
    opt.textContent = market.name;
    marketSelect.appendChild(opt);
  });

  cropSelect.value = state.cropId;
  marketSelect.value = state.marketId;

  cropSelect.addEventListener('change', function () {
    state.cropId = this.value;
    state.mapMarketId = state.marketId;
    resetScenario();
    render();
  });

  marketSelect.addEventListener('change', function () {
    state.marketId = this.value;
    state.mapMarketId = this.value;
    resetScenario();
    render();
  });
}

/* ==========================================================================
   RENDER: HERO CARD
   ========================================================================== */
function renderHero() {
  const crop = getCrop(state.cropId);
  const market = getMarket(state.marketId);
  const info = getMarketData(state.cropId, state.marketId);

  $('#heroContext').textContent = crop.name + ' · ' + market.name + ' · ' + market.state;
  $('#heroPrice').textContent = formatRupees(info.currentPrice);
  $('.hero__unit').textContent = '/ ' + crop.unit;

  const change = $('#heroChange');
  change.textContent = formatPercent(info.signals.momentum) + ' over the last 7 days';
  change.setAttribute('data-dir', info.signals.momentum >= 0 ? 'up' : 'down');

  $('#heroRange').textContent = formatRupees(info.forecastLow) + ' – ' + formatRupees(info.forecastHigh);

  const rising = info.forecastMid >= info.currentPrice;
  $('#heroTrend').textContent = rising ? '↑ Likely to increase' : '↓ Likely to decrease';

  const verdict = $('#heroVerdict');
  verdict.textContent = info.recommendation;
  verdict.setAttribute('data-value', info.recommendation);
  $('#heroNote').textContent = info.note;

  const chip = $('#selectorVerdict');
  chip.textContent = info.recommendation;
  chip.setAttribute('data-value', info.recommendation);

  // Confidence ring (circumference of r=38 is about 239)
  $('#confidenceNum').textContent = info.confidence + '%';
  $('#confidenceArc').style.strokeDashoffset = 239 - (239 * info.confidence) / 100;
  $('#factorConfidence').textContent = info.confidence + '%';

  drawSparkline($('#heroSpark'), priceHistory, priceForecast);
}

/* ==========================================================================
   RENDER: "WHY THIS RECOMMENDATION" LIST
   ========================================================================== */
function directionMark(direction) {
  if (direction === 'up') return '<span class="dir dir--up">↑</span>';
  if (direction === 'down') return '<span class="dir dir--down">↓</span>';
  return '<span class="dir dir--flat">→</span>';
}

/** Factor directions follow the selected market's own signals. */
function factorsForMarket() {
  const s = getMarketData(state.cropId, state.marketId).signals;
  return FORECAST_FACTORS.map(function (f) {
    let direction = f.direction;
    if (f.id === 'arrivals') direction = s.supply > 55 ? 'up' : 'down';
    if (f.id === 'momentum') direction = s.momentum >= 0 ? 'up' : 'down';
    return Object.assign({}, f, { direction: direction });
  });
}

function renderWhyList() {
  const list = $('#whyList');
  list.innerHTML = '';
  factorsForMarket().forEach(function (f, i) {
    const li = document.createElement('li');
    li.className = 'why__item';
    li.innerHTML =
      '<span class="why__rank">' + (i + 1) + '</span>' +
      '<span><span class="why__label">' + directionMark(f.direction) + ' ' + f.label + '</span>' +
      '<span class="why__impact">' + f.impact + ' impact</span></span>';
    list.appendChild(li);
  });
}

/* ==========================================================================
   RENDER: MARKET SIGNAL CARDS
   ========================================================================== */
function supplyStatus(value) {
  if (value < 45) return { status: 'Low', tone: 'warning' };
  if (value > 60) return { status: 'High', tone: 'neutral' };
  return { status: 'Moderate', tone: 'neutral' };
}

function demandStatus(value) {
  if (value > 65) return { status: 'High', tone: 'positive' };
  if (value < 50) return { status: 'Low', tone: 'warning' };
  return { status: 'Moderate', tone: 'neutral' };
}

const WEATHER_TEXT = {
  Low: 'Conditions look stable for the coming week.',
  Moderate: 'Expected rainfall may affect near-term supply.',
  High: 'Heavy rainfall could disrupt market arrivals.'
};

function renderSignals() {
  const s = getMarketData(state.cropId, state.marketId).signals;
  const supply = supplyStatus(s.supply);
  const demand = demandStatus(s.demand);
  const momentumUp = s.momentum >= 0;

  const cards = [
    {
      icon: '🌱', label: 'Estimated supply', value: s.supply, max: 100,
      status: supply.status, tone: supply.tone, meter: s.supply, meterTone: supply.tone,
      estimated: true,
      desc: s.supply < 50
        ? 'Market arrivals are below the recent average.'
        : 'Market arrivals are at or above the recent average.'
    },
    {
      icon: '🛒', label: 'Estimated demand', value: s.demand, max: 100,
      status: demand.status, tone: demand.tone, meter: s.demand, meterTone: 'positive',
      estimated: true,
      desc: s.demand > 60
        ? 'Demand indicators are stronger than usual.'
        : 'Demand indicators are close to the seasonal norm.'
    },
    {
      icon: '🌧️', label: 'Weather impact', value: s.weather, max: null,
      status: s.weather, tone: s.weather === 'High' ? 'warning' : 'neutral',
      meter: s.weather === 'High' ? 80 : s.weather === 'Moderate' ? 50 : 22, meterTone: 'warning',
      estimated: false, desc: WEATHER_TEXT[s.weather]
    },
    {
      icon: '📈', label: 'Price momentum', value: formatPercent(s.momentum), max: null,
      status: momentumUp ? 'Positive' : 'Negative', tone: momentumUp ? 'positive' : 'negative',
      meter: Math.min(100, Math.abs(s.momentum) * 9), meterTone: momentumUp ? 'positive' : 'warning',
      estimated: false,
      desc: momentumUp
        ? 'Prices have strengthened over the last 7 days.'
        : 'Prices have softened over the last 7 days.'
    }
  ];

  const grid = $('#signalGrid');
  grid.innerHTML = '';
  cards.forEach(function (c) {
    const el = document.createElement('article');
    el.className = 'card signal';
    el.innerHTML =
      '<div class="signal__top">' +
        '<span class="signal__icon" aria-hidden="true">' + c.icon + '</span>' +
        '<span class="tag tag--' + c.tone + '">' + c.status + '</span>' +
      '</div>' +
      '<div>' +
        '<p class="signal__label">' + c.label + '</p>' +
        '<p class="signal__value num">' + c.value + (c.max ? ' <small>/ ' + c.max + '</small>' : '') + '</p>' +
      '</div>' +
      '<div class="signal__meter"><i style="width:' + c.meter + '%" data-tone="' + c.meterTone + '"></i></div>' +
      '<p class="signal__desc">' + c.desc + '</p>' +
      (c.estimated ? '<p class="signal__est">Estimated indicator — not a measured total.</p>' : '');
    grid.appendChild(el);
  });
}

/* ==========================================================================
   RENDER: CHART + FORECAST BREAKDOWN
   ========================================================================== */
function renderChart() {
  drawPriceChart($('#chartHost'), priceHistory, priceForecast, state.rangeDays, $('#chartTooltip'));
}

function renderFactors() {
  const change = expectedChangePct(state.cropId, state.marketId);
  $('#breakdownTitle').textContent = change >= 0
    ? 'Why is the price expected to rise?'
    : 'Why is the price expected to fall?';

  const list = $('#factorList');
  list.innerHTML = '';
  factorsForMarket().forEach(function (f, i) {
    const li = document.createElement('li');
    li.className = 'factor';
    li.innerHTML =
      '<span class="factor__rank">' + (i + 1) + '</span>' +
      '<div>' +
        '<p class="factor__label">' + f.label + ' ' + directionMark(f.direction) + '</p>' +
        '<p class="factor__note">' + f.note + '</p>' +
        '<div class="factor__bar"><i style="width:' + f.weight + '%" data-impact="' + f.impact + '"></i></div>' +
      '</div>' +
      '<span class="factor__impact"><span class="tag tag--' +
        (f.impact === 'High' ? 'positive' : 'neutral') + '">' + f.impact + ' impact</span></span>';
    list.appendChild(li);
  });
}

/* ==========================================================================
   RENDER: MARKET COMPARISON TABLE
   ========================================================================== */
function renderComparison() {
  const body = $('#comparisonBody');
  body.innerHTML = '';

  const rows = MARKETS.map(function (m) {
    const info = getMarketData(state.cropId, m.id);
    return { market: m, info: info, change: expectedChangePct(state.cropId, m.id) };
  });

  // "Best" = highest current price. Transport cost is not modelled, so we say so.
  let bestId = rows[0].market.id;
  rows.forEach(function (r) {
    if (r.info.currentPrice > getMarketData(state.cropId, bestId).currentPrice) bestId = r.market.id;
  });

  rows.forEach(function (r) {
    const tr = document.createElement('tr');
    if (r.market.id === state.marketId) tr.className = 'is-selected';
    tr.setAttribute('tabindex', '0');
    tr.innerHTML =
      '<td><span class="market-cell">' + r.market.name +
        (r.market.id === bestId ? '<span class="best-tag">HIGHEST PRICE</span>' : '') + '</span></td>' +
      '<td class="num">' + formatRupees(r.info.currentPrice) + '</td>' +
      '<td class="num">' + formatRupees(r.info.forecastMid) + '</td>' +
      '<td class="num ' + (r.change >= 0 ? 'delta--up' : 'delta--down') + '">' + formatPercent(r.change) + '</td>' +
      '<td><span class="verdict-chip" data-value="' + r.info.recommendation + '">' + r.info.recommendation + '</span></td>';

    function choose() {
      state.marketId = r.market.id;
      state.mapMarketId = r.market.id;
      $('#marketSelect').value = r.market.id;
      resetScenario();
      render();
    }
    tr.addEventListener('click', choose);
    tr.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
    });

    body.appendChild(tr);
  });
}

/* ==========================================================================
   RENDER: MARKET MAP
   ========================================================================== */
function renderMap() {
  const group = $('#mapPoints');
  group.innerHTML = '';

  MARKETS.forEach(function (m) {
    const info = getMarketData(state.cropId, m.id);
    const active = m.id === state.mapMarketId;

    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'map-point' + (active ? ' is-active' : ''));
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', m.name + ', ' + formatRupees(info.currentPrice) + ' per quintal');

    const labelWidth = 128;
    const labelX = m.mapX - labelWidth / 2;
    const labelY = m.labelDir === 'up' ? m.mapY - 46 : m.mapY + 18;
    const stemY = m.labelDir === 'up' ? m.mapY - 18 : m.mapY + 18;

    g.innerHTML =
      '<line class="map-point__stem" x1="' + m.mapX + '" y1="' + m.mapY + '" x2="' + m.mapX + '" y2="' + stemY + '"></line>' +
      '<circle class="map-point__halo" cx="' + m.mapX + '" cy="' + m.mapY + '" r="16"></circle>' +
      '<circle class="map-point__dot" cx="' + m.mapX + '" cy="' + m.mapY + '" r="6.5"></circle>' +
      '<rect class="map-point__pill" x="' + labelX + '" y="' + labelY + '" width="' + labelWidth + '" height="28" rx="7"></rect>' +
      '<text class="map-point__name" x="' + (labelX + 11) + '" y="' + (labelY + 18) + '">' + m.name + '</text>' +
      '<text class="map-point__price" x="' + (labelX + labelWidth - 11) + '" y="' + (labelY + 18) + '" text-anchor="end">' +
        formatRupees(info.currentPrice) + '</text>';

    function pick() {
      state.mapMarketId = m.id;
      renderMap();
      renderMapPanel();
    }
    g.addEventListener('click', pick);
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
    });

    group.appendChild(g);
  });
}

function renderMapPanel() {
  const m = getMarket(state.mapMarketId);
  const info = getMarketData(state.cropId, state.mapMarketId);
  const change = expectedChangePct(state.cropId, state.mapMarketId);

  $('#mapName').textContent = m.name;
  $('#mapPrice').textContent = formatRupees(info.currentPrice);
  $('#mapForecast').textContent = formatRupees(info.forecastMid);
  $('#mapChange').textContent = formatPercent(change);
  $('#mapConfidence').textContent = info.confidence + '%';
  $('#mapNote').textContent = info.note;

  const chip = $('#mapVerdict');
  chip.textContent = info.recommendation;
  chip.setAttribute('data-value', info.recommendation);

  const btn = $('#mapUseBtn');
  const alreadyOpen = state.mapMarketId === state.marketId;
  btn.textContent = alreadyOpen ? 'Already on the dashboard' : 'Load ' + m.name + ' on the dashboard';
  btn.disabled = alreadyOpen;
  btn.style.opacity = alreadyOpen ? '.5' : '1';
  btn.style.cursor = alreadyOpen ? 'default' : 'pointer';
}

/* ==========================================================================
   RENDER: STATIC LISTS (insights, steps, roadmap)
   ========================================================================== */
function renderStaticLists() {
  const insightGrid = $('#insightGrid');
  insightGrid.innerHTML = '';
  INSIGHTS.forEach(function (item) {
    const el = document.createElement('article');
    el.className = 'card insight';
    el.innerHTML =
      '<span class="insight__rule" aria-hidden="true"></span>' +
      '<h3 class="insight__title">' + item.title + '</h3>' +
      '<p class="insight__text">' + item.text + '</p>';
    insightGrid.appendChild(el);
  });

  const stepList = $('#stepList');
  stepList.innerHTML = '';
  PIPELINE.forEach(function (s, i) {
    const li = document.createElement('li');
    li.className = 'step';
    li.innerHTML =
      '<p class="step__num">0' + (i + 1) + '</p>' +
      '<h3 class="step__title">' + s.title + '</h3>' +
      '<p class="step__text">' + s.text + '</p>';
    stepList.appendChild(li);
  });

  const roadmapList = $('#roadmapList');
  roadmapList.innerHTML = '';
  ROADMAP.forEach(function (r) {
    const li = document.createElement('li');
    li.className = 'roadmap__item';
    li.innerHTML =
      '<p class="roadmap__phase">' + r.phase + '</p>' +
      '<h3 class="roadmap__title">' + r.title + '</h3>' +
      '<p class="roadmap__text">' + r.text + '</p>';
    roadmapList.appendChild(li);
  });
}

/* ==========================================================================
   WHAT-IF SIMULATOR
   ========================================================================== */
function resetScenario() {
  state.scenario = { supply: 0, demand: 0, exports: 0, rainfall: 'normal' };
  $('#supplyRange').value = 0;
  $('#demandRange').value = 0;
  $('#exportRange').value = 0;
  $$('.segmented__btn').forEach(function (b) {
    b.classList.toggle('is-active', b.dataset.rain === 'normal');
  });
}

function renderSimulator() {
  const info = getMarketData(state.cropId, state.marketId);
  const result = runScenario(info.baseline, state.scenario);

  $('#supplyVal').textContent = formatPercentWhole(state.scenario.supply);
  $('#demandVal').textContent = formatPercentWhole(state.scenario.demand);
  $('#exportVal').textContent = formatPercentWhole(state.scenario.exports);

  $('#simBaseline').textContent = formatRupees(info.baseline);
  $('#simScenario').textContent = formatRupees(result.scenario);
  $('#simImpact').textContent = formatPercent(result.impactPct);
  $('#simDirection').textContent = scenarioMessage(result.direction);
  $('#simImpactBox').setAttribute('data-dir', result.direction);

  // Bar grows left or right from the centre; 25% impact fills half the track.
  const bar = $('#simBar');
  const width = Math.min(50, (Math.abs(result.impactPct) / 25) * 50);
  bar.style.width = width + '%';
  bar.style.left = result.impactPct >= 0 ? '50%' : (50 - width) + '%';
  bar.setAttribute('data-dir', result.impactPct >= 0 ? 'up' : 'down');

  const driver = topScenarioDriver(state.scenario);
  const crop = getCrop(state.cropId).name;
  const market = getMarket(state.marketId).name;
  $('#simExplain').textContent = driver
    ? 'Largest contribution: ' + driver + '. Applied to the baseline ' + crop.toLowerCase() +
      ' forecast for ' + market + '. Simple weighted calculation, not a trained model.'
    : 'Move a slider or change the rainfall setting to build a scenario.';
}

function wireSimulator() {
  const map = { supplyRange: 'supply', demandRange: 'demand', exportRange: 'exports' };

  Object.keys(map).forEach(function (id) {
    $('#' + id).addEventListener('input', function () {
      state.scenario[map[id]] = Number(this.value);
      renderSimulator();
    });
  });

  $$('.segmented__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.segmented__btn').forEach(function (b) { b.classList.remove('is-active'); });
      this.classList.add('is-active');
      state.scenario.rainfall = this.dataset.rain;
      renderSimulator();
    });
  });

  $('#simReset').addEventListener('click', function () {
    resetScenario();
    renderSimulator();
  });
}

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
function wireNavigation() {
  const menu = $('#mobileMenu');
  const toggle = $('#menuToggle');

  toggle.addEventListener('click', function () {
    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  });

  $$('.mobile-menu__link').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Highlight the section currently in view.
  const sections = $$('main section');
  const links = $$('[data-nav]');

  function updateActive() {
    const marker = window.scrollY + 140;
    let currentId = sections[0].id;
    sections.forEach(function (section) {
      if (section.offsetTop <= marker) currentId = section.id;
    });
    links.forEach(function (link) {
      link.classList.toggle('is-active', link.dataset.nav === currentId);
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
}

/* ==========================================================================
   MISC WIRING
   ========================================================================== */
function wireChartRange() {
  $$('.range-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.range-btn').forEach(function (b) { b.classList.remove('is-active'); });
      this.classList.add('is-active');
      state.rangeDays = Number(this.dataset.days);
      renderChart();
    });
  });
}

function wireWhyToggle() {
  const btn = $('#whyToggle');
  const panel = $('#whyPanel');
  btn.addEventListener('click', function () {
    const open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });
}

function wireMapButton() {
  $('#mapUseBtn').addEventListener('click', function () {
    if (state.mapMarketId === state.marketId) return;
    state.marketId = state.mapMarketId;
    $('#marketSelect').value = state.marketId;
    resetScenario();
    render();
    const target = document.getElementById('dashboard');
    if (target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth' });
  });
}

function wireReveal() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  items.forEach(function (el) { observer.observe(el); });
}

/* Redraw the chart when the window size crosses the mobile/desktop boundary. */
function wireResize() {
  let timer = null;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      renderChart();
      drawSparkline($('#heroSpark'), priceHistory, priceForecast);
    }, 180);
  });
}

/* ==========================================================================
   MASTER RENDER
   ========================================================================== */
function render() {
  priceHistory = buildHistory(state.cropId, state.marketId);
  priceForecast = buildForecast(state.cropId, state.marketId);

  renderHero();
  renderWhyList();
  renderSignals();
  renderChart();
  renderFactors();
  renderComparison();
  renderMap();
  renderMapPanel();
  renderSimulator();
}

/* ==========================================================================
   START
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  buildSelectors();
  renderStaticLists();
  wireNavigation();
  wireChartRange();
  wireWhyToggle();
  wireMapButton();
  wireSimulator();
  wireResize();
  render();
  wireReveal();
});

/* ==========================================================================
   AgriPulse — charts.js
   --------------------------------------------------------------------------
   Draws SVG charts by hand. No chart library, no npm, no build step.

   Two things live here:
     1. drawPriceChart()  — the big "Price Trend & 7-Day Forecast" chart
     2. drawSparkline()   — the small forecast cone inside the hero card
   ========================================================================== */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Creates an SVG element with attributes in one line. */
function svgEl(name, attrs) {
  const el = document.createElementNS(SVG_NS, name);
  for (const key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}

function shortDate(date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* --------------------------------------------------------------------------
   Main price chart
   -------------------------------------------------------------------------- */

/**
 * @param {HTMLElement} host      element the chart is drawn into
 * @param {Array} history         [{date, price}]
 * @param {Array} forecast        [{date, low, mid, high}]
 * @param {number} visibleDays    how many history days to show (7 / 30 / 90)
 * @param {HTMLElement} tooltip   floating tooltip element
 */
function drawPriceChart(host, history, forecast, visibleDays, tooltip) {
  host.innerHTML = '';

  const shownHistory = history.slice(-visibleDays);
  const points = shownHistory
    .map(function (d) { return { date: d.date, value: d.price, kind: 'history' }; })
    .concat(forecast.map(function (d) {
      return { date: d.date, value: d.mid, low: d.low, high: d.high, kind: 'forecast' };
    }));

  // Narrow viewBox on small screens keeps labels and lines readable.
  const narrow = host.clientWidth < 620;
  const W = narrow ? 460 : 920;
  const H = narrow ? 300 : 340;
  const pad = { top: 24, right: narrow ? 14 : 20, bottom: 34, left: narrow ? 46 : 58 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  // ---- scales -------------------------------------------------------------
  const values = [];
  points.forEach(function (p) {
    values.push(p.value);
    if (p.low !== undefined) { values.push(p.low); values.push(p.high); }
  });
  let min = Math.min.apply(null, values);
  let max = Math.max.apply(null, values);
  const padding = Math.max((max - min) * 0.18, max * 0.01);
  min = min - padding;
  max = max + padding;

  const x = function (i) { return pad.left + (i / (points.length - 1)) * plotW; };
  const y = function (v) { return pad.top + plotH - ((v - min) / (max - min)) * plotH; };

  const svg = svgEl('svg', {
    viewBox: '0 0 ' + W + ' ' + H,
    class: 'chart-svg',
    role: 'img',
    'aria-label': 'Price history and seven day forecast, simulated data'
  });

  // ---- horizontal grid + price axis --------------------------------------
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const v = min + ((max - min) / ticks) * i;
    const yy = y(v);
    svg.appendChild(svgEl('line', {
      x1: pad.left, x2: W - pad.right, y1: yy, y2: yy, class: 'chart-grid'
    }));
    const label = svgEl('text', { x: pad.left - 10, y: yy + 4, class: 'chart-axis-label', 'text-anchor': 'end' });
    label.textContent = '₹' + Math.round(v).toLocaleString('en-IN');
    svg.appendChild(label);
  }

  const splitIndex = shownHistory.length - 1; // last real data point = today

  // ---- forecast background band ------------------------------------------
  svg.appendChild(svgEl('rect', {
    x: x(splitIndex), y: pad.top,
    width: (W - pad.right) - x(splitIndex), height: plotH,
    class: 'chart-forecast-zone'
  }));

  // ---- forecast range (cone) ---------------------------------------------
  const coneTop = [];
  const coneBottom = [];
  coneTop.push(x(splitIndex) + ',' + y(points[splitIndex].value));
  coneBottom.push(x(splitIndex) + ',' + y(points[splitIndex].value));
  for (let i = splitIndex + 1; i < points.length; i++) {
    coneTop.push(x(i) + ',' + y(points[i].high));
    coneBottom.unshift(x(i) + ',' + y(points[i].low));
  }
  svg.appendChild(svgEl('polygon', {
    points: coneTop.concat(coneBottom).join(' '),
    class: 'chart-cone'
  }));

  // ---- history line -------------------------------------------------------
  const historyPath = points.slice(0, splitIndex + 1)
    .map(function (p, i) { return x(i) + ',' + y(p.value); }).join(' ');
  svg.appendChild(svgEl('polyline', { points: historyPath, class: 'chart-line-history' }));

  // Soft fill under the history line.
  svg.appendChild(svgEl('polygon', {
    points: historyPath + ' ' + x(splitIndex) + ',' + (pad.top + plotH) + ' ' + pad.left + ',' + (pad.top + plotH),
    class: 'chart-area-history'
  }));

  // ---- forecast line ------------------------------------------------------
  const forecastPath = [];
  for (let i = splitIndex; i < points.length; i++) forecastPath.push(x(i) + ',' + y(points[i].value));
  svg.appendChild(svgEl('polyline', { points: forecastPath.join(' '), class: 'chart-line-forecast' }));

  // ---- "today" divider ----------------------------------------------------
  svg.appendChild(svgEl('line', {
    x1: x(splitIndex), x2: x(splitIndex), y1: pad.top, y2: pad.top + plotH, class: 'chart-divider'
  }));
  const todayLabel = svgEl('text', {
    x: x(splitIndex) + 6, y: pad.top + 12, class: 'chart-zone-label'
  });
  todayLabel.textContent = 'Forecast';
  svg.appendChild(todayLabel);

  // ---- current price marker ----------------------------------------------
  svg.appendChild(svgEl('circle', {
    cx: x(splitIndex), cy: y(points[splitIndex].value), r: 5.5, class: 'chart-marker'
  }));

  // ---- date axis ----------------------------------------------------------
  const labelStep = Math.max(1, Math.round(points.length / (narrow ? 4 : 7)));
  for (let i = 0; i < points.length; i += labelStep) {
    const t = svgEl('text', {
      x: x(i), y: H - 12, class: 'chart-axis-label', 'text-anchor': 'middle'
    });
    t.textContent = shortDate(points[i].date);
    svg.appendChild(t);
  }

  // ---- hover layer --------------------------------------------------------
  const hoverLine = svgEl('line', {
    x1: 0, x2: 0, y1: pad.top, y2: pad.top + plotH, class: 'chart-hover-line', opacity: 0
  });
  const hoverDot = svgEl('circle', { cx: 0, cy: 0, r: 4.5, class: 'chart-hover-dot', opacity: 0 });
  svg.appendChild(hoverLine);
  svg.appendChild(hoverDot);

  const capture = svgEl('rect', {
    x: pad.left, y: pad.top, width: plotW, height: plotH, fill: 'transparent'
  });
  svg.appendChild(capture);

  function hideTooltip() {
    tooltip.classList.remove('is-visible');
    hoverLine.setAttribute('opacity', 0);
    hoverDot.setAttribute('opacity', 0);
  }

  function moveTooltip(event) {
    const box = svg.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const svgX = ((clientX - box.left) / box.width) * W;

    let index = Math.round(((svgX - pad.left) / plotW) * (points.length - 1));
    index = Math.max(0, Math.min(points.length - 1, index));
    const point = points[index];

    hoverLine.setAttribute('x1', x(index));
    hoverLine.setAttribute('x2', x(index));
    hoverLine.setAttribute('opacity', 1);
    hoverDot.setAttribute('cx', x(index));
    hoverDot.setAttribute('cy', y(point.value));
    hoverDot.setAttribute('opacity', 1);

    const detail = point.kind === 'forecast'
      ? '<span class="tt-band">' + formatRupees(point.low) + ' – ' + formatRupees(point.high) + '</span>'
      : '';

    tooltip.innerHTML =
      '<span class="tt-date">' + shortDate(point.date) + (point.kind === 'forecast' ? ' · forecast' : '') + '</span>' +
      '<span class="tt-price">' + formatRupees(point.value) + '</span>' + detail;

    // Position tooltip inside the chart host.
    const hostBox = host.getBoundingClientRect();
    const px = (x(index) / W) * box.width + (box.left - hostBox.left);
    const py = (y(point.value) / H) * box.height + (box.top - hostBox.top);
    tooltip.style.left = px + 'px';
    tooltip.style.top = py + 'px';
    tooltip.classList.add('is-visible');
  }

  capture.addEventListener('mousemove', moveTooltip);
  capture.addEventListener('mouseleave', hideTooltip);
  capture.addEventListener('touchstart', moveTooltip, { passive: true });
  capture.addEventListener('touchmove', moveTooltip, { passive: true });
  capture.addEventListener('touchend', hideTooltip);

  host.appendChild(svg);
}

/* --------------------------------------------------------------------------
   Hero sparkline — last 21 days + the forecast cone
   -------------------------------------------------------------------------- */

function drawSparkline(host, history, forecast) {
  host.innerHTML = '';

  const recent = history.slice(-21);
  const points = recent.map(function (d) { return { v: d.price }; })
    .concat(forecast.map(function (d) { return { v: d.mid, low: d.low, high: d.high }; }));

  const W = 260, H = 74, pad = 8;
  const values = [];
  points.forEach(function (p) {
    values.push(p.v);
    if (p.low !== undefined) { values.push(p.low); values.push(p.high); }
  });
  const min = Math.min.apply(null, values) * 0.995;
  const max = Math.max.apply(null, values) * 1.005;

  const x = function (i) { return pad + (i / (points.length - 1)) * (W - pad * 2); };
  const y = function (v) { return pad + (H - pad * 2) - ((v - min) / (max - min)) * (H - pad * 2); };

  const svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'spark-svg', 'aria-hidden': 'true' });
  const split = recent.length - 1;

  const top = [x(split) + ',' + y(points[split].v)];
  const bottom = [x(split) + ',' + y(points[split].v)];
  for (let i = split + 1; i < points.length; i++) {
    top.push(x(i) + ',' + y(points[i].high));
    bottom.unshift(x(i) + ',' + y(points[i].low));
  }
  svg.appendChild(svgEl('polygon', { points: top.concat(bottom).join(' '), class: 'spark-cone' }));

  svg.appendChild(svgEl('polyline', {
    points: points.slice(0, split + 1).map(function (p, i) { return x(i) + ',' + y(p.v); }).join(' '),
    class: 'spark-history'
  }));

  const fc = [];
  for (let i = split; i < points.length; i++) fc.push(x(i) + ',' + y(points[i].v));
  svg.appendChild(svgEl('polyline', { points: fc.join(' '), class: 'spark-forecast' }));
  svg.appendChild(svgEl('circle', { cx: x(split), cy: y(points[split].v), r: 3.5, class: 'spark-dot' }));

  host.appendChild(svg);
}

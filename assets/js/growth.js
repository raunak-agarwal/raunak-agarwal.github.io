/* Original canvas study inspired by the branching cells at recursive.com.
   No remote scripts or animation assets; the artwork follows the site's theme. */
(function () {
  'use strict';

  const host = document.getElementById('growth-art');
  const canvas = document.getElementById('growth-canvas');
  const toggle = document.getElementById('growth-toggle');
  const controls = document.getElementById('growth-controls');
  const speedControl = document.getElementById('growth-speed');
  const reset = document.getElementById('growth-reset');
  if (!host || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Recursive's header preset: genSpeed=2000 ms, growth tied to that interval,
  // fadeInDuration=1000 ms, parentTransition=2717 ms (all values below in seconds).
  const timing = { generation: 2, growth: 2, fadeIn: 1, settle: 2.717 };
  let paused = motion.matches;
  let stillPreview = motion.matches;
  let visible = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let speed = 1;
  let growthDuration = 30;
  let gridSize = 64;
  let width = 0;
  let height = 0;
  let occupied = new Map();
  let nextId = 1;
  let unit = 16;
  let columns = 0;
  let rows = 0;
  let nodes = [];
  let seeds = [];
  let palette = {};
  let pointer = null;
  let hoverCell = null;
  let hoverStarted = 0;

  function random(seed) {
    const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function smooth(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function readPalette() {
    const style = getComputedStyle(host);
    ['node', 'line', 'signal', 'highlight', 'core'].forEach(function (key) {
      palette[key] = style.getPropertyValue('--growth-' + key).trim();
    });
    palette.light = document.documentElement.dataset.theme === 'light';
    draw();
  }

  // Cells are allocated as the tree grows. Larger and smaller neighbors share
  // one 16px occupancy grid, so branches touch without overlapping tiles.
  function key(x, y) { return y * columns + x; }

  function fits(x, y, span) {
    if (x < 0 || y < 0 || x + span > columns || y + span > rows) return false;
    for (let yy = y; yy < y + span; yy++) {
      for (let xx = x; xx < x + span; xx++) {
        if (occupied.has(key(xx, yy))) return false;
      }
    }
    return true;
  }

  function addNode(gx, gy, level, born, parent) {
    const span = 4 >> level;
    if (!fits(gx, gy, span)) return null;
    const size = unit * span;
    const cell = {
      id: nextId++, gx: gx, gy: gy, span: span, level: level,
      x: gx * unit, y: gy * unit, size: size,
      cx: (gx + span / 2) * unit, cy: (gy + span / 2) * unit,
      born: born, parent: parent, children: [],
      seedX: parent ? parent.seedX : (gx + span / 2) * unit,
      seedY: parent ? parent.seedY : (gy + span / 2) * unit,
      generation: parent ? parent.generation + 1 : 0,
      next: born + timing.generation, hover: 0
    };
    if (parent) {
      parent.children.push(cell);
    }
    nodes.push(cell);
    for (let y = gy; y < gy + span; y++) {
      for (let x = gx; x < gx + span; x++) occupied.set(key(x, y), cell);
    }
    return cell;
  }

  function cellAt(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return null;
    const gx = Math.floor(x / unit), gy = Math.floor(y / unit);
    const existing = occupied.get(key(gx, gy));
    if (existing) return existing;
    // Empty space keeps the largest available grid cell until it is divided.
    for (let level = 0; level <= 2; level++) {
      const span = 4 >> level;
      const xx = Math.floor(gx / span) * span, yy = Math.floor(gy / span) * span;
      if (fits(xx, yy, span)) return {
        gx: xx, gy: yy, level: level, x: xx * unit, y: yy * unit,
        size: span * unit, cx: (xx + span / 2) * unit, cy: (yy + span / 2) * unit
      };
    }
    return null;
  }

  function childLevel(parent, salt) {
    const r = random(parent.id * 17 + salt);
    if (parent.level === 0) return r < 0.8 ? 1 : 0;
    if (parent.level === 2) return r < 0.5 ? 2 : 1;
    return r < 0.36 ? 2 : r < 0.56 ? 1 : 0;
  }

  function branch(parent, time) {
    parent.next = Infinity;
    if (parent.generation >= 50) return;
    // Each seed spreads outward. Eight initial arms balance the composition;
    // later forks choose free neighbors without turning back into their seed.
    const directions = [[1, 0], [-1, 0], [0, -1], [0, 1], [1, -1], [-1, -1], [1, 1], [-1, 1]];
    const vx = parent.cx - parent.seedX, vy = parent.cy - parent.seedY;
    const distance = Math.hypot(vx, vy) || 1;
    const outward = function (direction) {
      return (direction[0] * vx + direction[1] * vy) / (Math.hypot(...direction) * distance);
    };
    const score = function (direction) {
      return outward(direction) * 0.65 + random(parent.id * 31 + direction[0] * 7 + direction[1] * 13);
    };
    if (parent.generation > 0) directions.sort(function (a, b) { return score(b) - score(a); });
    const branching = random(parent.id * 11 + 7);
    const wanted = parent.generation === 0 ? 8 : branching < 0.6 ? 1 : branching < 0.95 ? 2 : 3;
    let added = 0;
    for (const direction of directions) {
      const dx = direction[0], dy = direction[1];
      if (parent.generation > 0 && outward(direction) < -0.15) continue;
      const level = parent.generation === 0 ? 1 : childLevel(parent, dx * 7 + dy * 13 + 23);
      const span = 4 >> level;
      const gx = dx < 0 ? parent.gx - span : dx > 0 ? parent.gx + parent.span
        : parent.gx + Math.floor((parent.span - span) / 2);
      const gy = dy < 0 ? parent.gy - span : dy > 0 ? parent.gy + parent.span
        : parent.gy + Math.floor((parent.span - span) / 2);
      if (addNode(gx, gy, level, time, parent)) added++;
      if (added >= wanted) break;
    }
  }

  function advanceGrowth(time) {
    // Process generations at their exact scheduled times, even after a slow frame.
    while (true) {
      let next = null;
      for (const cell of nodes) {
        if (cell.next <= time && (!next || cell.next < next.next)) next = cell;
      }
      if (!next) break;
      branch(next, next.next);
    }
  }

  function sprout(x, y, time) {
    const target = cellAt(x, y);
    if (!target) return;
    const root = target.id ? target : addNode(target.gx, target.gy, target.level, time, null);
    if (!root) return;
    root.activated = time;
    // Clicking an existing node gives it another chance to fill a free neighbor.
    root.next = Math.min(root.next, time + timing.generation);
  }

  function build() {
    const bounds = host.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const viewportWidth = window.innerWidth || width;
    gridSize = viewportWidth < 480 ? 38 : viewportWidth < 768 ? 42 : viewportWidth < 992 ? 48 : 64;
    unit = gridSize / 4;
    columns = Math.max(4, Math.floor(width / unit));
    rows = Math.max(4, Math.floor(height / unit));
    occupied = new Map();
    nodes = [];
    nextId = 1;
    hoverCell = null;
    addNode(Math.round((columns - 4) / 2), Math.round((rows - 4) / 2), 0, 0, null);
    // Replay explicit seeds on resize without resetting the animation's age.
    for (const seed of seeds) {
      advanceGrowth(seed.time);
      sprout(seed.x * width, seed.y * height, seed.time);
    }
    growthDuration = Math.max(100, ...seeds.map(function (seed) { return seed.time + 100; }));
    advanceGrowth(stillPreview ? growthDuration + 2 : elapsed);
    draw();
  }

  function plant(x, y) {
    if (stillPreview) elapsed = growthDuration + 2;
    stillPreview = false;
    paused = false;
    seeds.push({ x: x / width, y: y / height, time: elapsed });
    sprout(x, y, elapsed);
    syncPlayback();
  }

  function hoveredBranch(time) {
    const branch = new Map();
    const hovered = pointer ? cellAt(pointer.x, pointer.y) : null;
    if (hovered !== hoverCell) {
      hoverCell = hovered;
      hoverStarted = performance.now();
    }
    if (!hovered || hovered.born === undefined || hovered.born > time) return branch;
    const age = (performance.now() - hoverStarted) / 1000;
    const pending = [{ cell: hovered, depth: 0 }];
    while (pending.length) {
      const item = pending.pop();
      if (item.cell.born > time) continue;
      const strength = paused || stillPreview ? 1 : smooth((age - Math.min(item.depth * 0.025, 0.5)) / 0.14);
      branch.set(item.cell, strength);
      item.cell.children.forEach(function (child) {
        pending.push({ cell: child, depth: item.depth + 1 });
      });
    }
    return branch;
  }

  function tile(x, y, halfSize, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    const side = Math.max(0, halfSize * 2);
    ctx.roundRect(x - halfSize, y - halfSize, side, side, side * 0.18);
    ctx.fill();
  }

  function draw() {
    if (!width || !palette.node) return;
    const time = stillPreview ? growthDuration + 2 : elapsed;
    advanceGrowth(time);
    const highlighted = hoveredBranch(time);
    ctx.clearRect(0, 0, width, height);

    // Only the coarse grid exists at first. Smaller cells emerge with growth.
    ctx.lineWidth = 0.65;
    ctx.strokeStyle = palette.line;
    ctx.globalAlpha = 0.11;
    ctx.beginPath();
    for (let x = 0; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    nodes.forEach(function (cell) {
      const target = highlighted.get(cell) || 0;
      cell.hover = paused || stillPreview ? target : cell.hover + (target - cell.hover) * 0.2;
      if (cell.hover < 0.002) cell.hover = 0;
      const age = time - cell.born;
      const grown = Math.min(1, (age + (cell.parent ? 0 : 0.25)) / timing.growth);
      const opacity = Math.min(1, (age + (cell.parent ? 0 : 0.25)) / timing.fadeIn);
      // A new tile unfolds from its parent's nearest edge/corner, staying
      // inside its own square. This makes the growing tips feel connected.
      const originX = cell.parent ? Math.max(cell.x, Math.min(cell.x + cell.size, cell.parent.cx)) : cell.cx;
      const originY = cell.parent ? Math.max(cell.y, Math.min(cell.y + cell.size, cell.parent.cy)) : cell.cy;
      cell.drawX = originX + (cell.cx - originX) * grown;
      cell.drawY = originY + (cell.cy - originY) * grown;
      const radius = cell.size * 0.49 * grown;
      const fresh = stillPreview ? 0 : 1 - smooth((age - timing.growth) / timing.settle);

      ctx.globalAlpha = opacity * 0.18;
      ctx.strokeStyle = palette.line;
      ctx.lineWidth = 0.65;
      ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);
      // Keep the theme colors intact once visible. Theme-dependent opacity
      // previously made new growth muddy, especially against the light page.
      tile(cell.drawX, cell.drawY, radius, palette.node, opacity);
      if (fresh > 0) tile(cell.drawX, cell.drawY, radius, palette.signal, fresh * opacity);
      if (cell.hover > 0) {
        tile(cell.drawX, cell.drawY, radius, palette.highlight, cell.hover);
        if (cell === hoverCell) tile(cell.drawX, cell.drawY, radius, palette.core, cell.hover);
      }
      const flash = cell.activated === undefined ? 0 : Math.max(0, 1 - (time - cell.activated) / 0.3);
      if (flash) tile(cell.drawX, cell.drawY, radius, palette.core, flash * 0.85);
    });

    if (pointer) {
      const hovered = cellAt(pointer.x, pointer.y);
      if (hovered) {
        ctx.globalAlpha = 0.16;
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 1;
        ctx.strokeRect(hovered.x, hovered.y, hovered.size, hovered.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  function tick(time) {
    frame = 0;
    if (paused || !visible || document.hidden) return;
    elapsed += Math.min((time - lastTime) / 1000, 0.1) * speed;
    lastTime = time;
    draw();
    frame = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = performance.now();
    toggle.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    toggle.title = paused ? 'Play animation' : 'Pause animation';
    toggle.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
    draw();
  }

  controls.hidden = false;
  speedControl.addEventListener('change', function () {
    speed = Number(speedControl.value);
  });
  reset.addEventListener('click', function () {
    elapsed = 0;
    seeds = [];
    stillPreview = false;
    paused = motion.matches;
    build();
    syncPlayback();
  });
  toggle.addEventListener('click', function () {
    const restart = stillPreview;
    if (restart) elapsed = 0;
    stillPreview = false;
    if (restart) build();
    paused = !paused;
    syncPlayback();
  });
  motion.addEventListener('change', function () {
    paused = motion.matches;
    stillPreview = motion.matches;
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  canvas.addEventListener('click', function (event) {
    const bounds = canvas.getBoundingClientRect();
    plant(event.clientX - bounds.left, event.clientY - bounds.top);
  });
  canvas.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    plant(width / 2, height / 2);
  });
  canvas.addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch') return;
    const bounds = host.getBoundingClientRect();
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    if (paused) draw();
  });
  canvas.addEventListener('pointerleave', function () { pointer = null; if (paused) draw(); });
  new MutationObserver(readPalette).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new ResizeObserver(build).observe(host);
  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    syncPlayback();
  }).observe(host);
  readPalette();
  build();
  syncPlayback();
})();

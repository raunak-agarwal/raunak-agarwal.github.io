/*
 * Ocean rendering inspired by https://earendil.com/.
 * Wave model and atmosphere adapted from "Very fast procedural ocean":
 * https://www.shadertoy.com/view/MdXyzX
 * Copyright (c) 2017-2024 afl_ext — MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function () {
  'use strict';

  function startWater() {
  const host = document.getElementById('water-art');
  const canvas = document.getElementById('water-canvas');
  const toggle = document.getElementById('water-toggle');
  if (!host || !canvas || !toggle) return;

  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return;

  // Keep the pointer projection and the rendered camera in sync.
  const cameraTilt = -0.12;
  const cameraHeight = 1.5;
  const projectionDepth = 1.5;
  const maxRipples = 16;
  const rippleLifetime = 6;
  const ripples = [];
  const rippleData = new Float32Array(maxRipples * 4);

  const vertexSource = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `;
  const fragmentSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform float night;
    uniform vec3 shadowColor;
    uniform vec3 highlightColor;
    uniform vec3 glowColor;
    uniform vec4 ripples[${maxRipples}]; // world x/z, birth time, amplitude
    uniform int rippleCount;

    // Return the surface slope and glow together: one ripple pass per pixel.
    vec3 disturbance(vec2 p) {
      vec3 result = vec3(0.0);
      for (int i = 0; i < ${maxRipples}; i++) {
        if (i >= rippleCount) break;
        float age = time - ripples[i].z;
        float amplitude = ripples[i].w;
        bool wake = amplitude < 0.1;
        float lifetime = wake ? 1.2 : ${rippleLifetime.toFixed(1)};
        float scale = wake ? 0.6 : mix(1.0, 2.1, clamp((amplitude - 0.18) / 0.32, 0.0, 1.0));
        vec2 delta = p - ripples[i].xy;
        float radius = length(delta);
        // A small packet of rings travels outward; the center settles behind it.
        float front = radius / scale - age * 1.6;
        float width = 0.65 + age * 0.12;
        if (abs(front) > width * 3.0) continue;
        float envelope = exp(-front * front / (width * width));
        float fade = smoothstep(0.0, 0.15, age) * exp(-age * 0.5)
          * (1.0 - smoothstep(lifetime * 0.75, lifetime, age));
        float sine = sin(front * 8.0);
        float strength = amplitude * envelope * fade;
        float slope = strength * (8.0 * cos(front * 8.0) - sine * 2.0 * front / (width * width)) / scale;
        result.xy += delta / max(radius, 0.001) * slope;
        result.z += abs(sine) * strength;
      }
      return result;
    }

    // Successive waves drag smaller waves along their slopes.
    float waves(vec2 p, int count) {
      float phase = length(p) * 0.1;
      vec2 swellDirection = normalize(vec2(-0.25, 1.0));
      float frequency = 1.0;
      float speed = 2.0;
      float weight = 1.0;
      float sum = 0.0;
      float weights = 0.0;
      float angle = 0.0;
      for (int i = 0; i < 16; i++) {
        if (i >= count) break;
        vec2 direction = normalize(mix(vec2(sin(angle), cos(angle)), swellDirection, 0.35));
        float x = dot(direction, p) * frequency + time * speed + phase;
        float wave = exp(sin(x) - 1.0);
        p -= direction * wave * cos(x) * weight * 0.38;
        sum += wave * weight;
        weights += weight;
        weight *= 0.8;
        frequency *= 1.18;
        speed *= 1.07;
        angle += 1232.399963;
      }
      float swell = sin(dot(p, swellDirection) * 0.18 - time * 0.08);
      float fade = 1.0 - smoothstep(4.0, 28.0, length(p - vec2(time * 0.2, 1.0)));
      return sum / weights + swell * fade * 0.35;
    }

    float waterDistance(vec3 origin, vec3 ray) {
      float top = -origin.y / ray.y;
      vec3 p = origin + ray * top;
      for (int i = 0; i < 24; i++) {
        float height = waves(p.xz, 6) - 1.0;
        if (height + 0.01 > p.y) return distance(p, origin);
        p += ray * (p.y - height);
      }
      return top;
    }

    vec3 normal(vec2 p, float e, vec2 rippleSlope) {
      float h = waves(p, 16);
      vec2 left = p - vec2(e, 0.0);
      vec2 ahead = p + vec2(0.0, e);
      return normalize(vec3(waves(left, 16) - h - rippleSlope.x * e, e,
        h - waves(ahead, 16) - rippleSlope.y * e));
    }

    vec3 atmosphere(vec3 ray) {
      vec3 sun = normalize(vec3(-0.07735, 0.6, 0.57735));
      float horizon = 1.0 / (ray.y + 0.1);
      float sunAmount = pow(abs(dot(sun, ray)), 2.0);
      vec3 sunColor = mix(vec3(1.0), vec3(1.0) - vec3(5.5, 13.0, 22.4) / 22.4,
        1.0 / (sun.y * 11.0 + 1.0));
      vec3 sky = vec3(12.0, 12.0, 13.0) / 22.4 * sunColor;
      sky = max(vec3(0.0), sky - vec3(12.0, 12.0, 13.0) * 0.002 * (horizon - 6.0 * sun.y * sun.y));
      sky *= horizon * (0.24 + sunAmount * 0.24);
      sky *= (1.0 + pow(1.0 - ray.y, 3.0)) * 0.5;
      vec3 nightSky = mix(vec3(0.03, 0.035, 0.05), vec3(0.015, 0.02, 0.04), ray.y * 0.5 + 0.5);
      return mix(sky, nightSky, night);
    }

    vec3 tonemap(vec3 color) {
      mat3 m1 = mat3(0.59719, 0.07600, 0.02840, 0.35458, 0.90834, 0.13383, 0.04823, 0.01566, 0.83777);
      mat3 m2 = mat3(1.60475, -0.10208, -0.00327, -0.53108, 1.10813, -0.07276, -0.07367, -0.00605, 1.07602);
      vec3 v = m1 * color;
      vec3 a = v * (v + 0.0245786) - 0.000090537;
      vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
      return pow(clamp(m2 * (a / b), 0.0, 1.0), vec3(1.0 / 2.2));
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy / resolution * 2.0 - 1.0) * vec2(resolution.x / resolution.y, 1.0);
      // Look slightly down: keep the same rolling surface in a shorter canvas.
      float tilt = ${cameraTilt};
      vec3 ray = normalize(vec3(uv, ${projectionDepth}));
      ray.yz = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * ray.yz;
      vec3 color;
      float glow = 0.0;
      if (ray.y >= 0.0) {
        color = tonemap(atmosphere(ray) * 2.0);
      } else {
        vec3 origin = vec3(time * 0.2, ${cameraHeight}, 1.0);
        float distanceToWater = waterDistance(origin, ray);
        vec3 hit = origin + ray * distanceToWater;
        vec3 rippling = disturbance(hit.xz);
        vec3 n = normal(hit.xz, max(0.01, distanceToWater * 0.004), rippling.xy);
        glow = night * min(rippling.z * 1.1, 0.12) * exp(-distanceToWater * 0.015);
        float far = min(1.0, sqrt(distanceToWater * 0.01) * 1.1);
        n = mix(n, vec3(0.0, 1.0, 0.0), 0.8 * far);
        float fresnel = 0.04 + 0.96 * pow(1.0 - max(0.0, dot(-n, ray)), 5.0);
        float flatFresnel = 0.04 + 0.96 * pow(1.0 - max(0.0, -ray.y), 5.0);
        fresnel = mix(fresnel, flatFresnel, far);
        vec3 reflection = normalize(reflect(ray, n));
        reflection.y = abs(reflection.y);
        vec3 scatter = mix(vec3(0.08, 0.08, 0.09), vec3(0.02, 0.02, 0.03), night) * (1.2 + hit.y);
        color = fresnel * atmosphere(reflection) + scatter;
        vec3 fog = mix(vec3(0.55, 0.55, 0.58), vec3(0.03, 0.035, 0.05), night);
        color = mix(color, fog, 1.0 - exp(-distanceToWater * 0.02));
        color = tonemap(color * mix(1.4, 1.9, night));
      }

      // Fine monochrome grain, matching the reference's printed texture.
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      float noise = fract(sin(dot(gl_FragCoord.xy / resolution, vec2(12.9898, 78.233))) * 43758.5453 + time * 1.5);
      float variance = pow(mix(0.75, 0.6, night), 2.0);
      noise = exp(-(noise * noise) / (2.0 * variance * variance)) / (variance * 2.5066);
      gray = clamp(gray + noise * (1.0 - gray) * mix(0.4, 0.065, night), 0.0, 1.0);
      // Match the page's warm/olive palette instead of laying neutral gray
      // over cream, which made the lower half look blue by comparison.
      vec3 surfaceColor = mix(shadowColor, highlightColor, gray);
      gl_FragColor = vec4(mix(surfaceColor, glowColor, glow), 1.0);
    }
  `;

  let program;
  let uniforms;
  let frame = 0;
  let elapsed = 12;
  let lastTime = 0;
  let visible = false;
  let ready = false;
  let gesture = null;
  let keyboardHold = null;
  let quality = 1;
  let frameSamples = 0;
  let frameDuration = 0;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    console.warn('Ocean shader could not compile:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  function initialize() {
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      return false;
    }
    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Ocean shader could not link:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return false;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    uniforms = {};
    ['resolution', 'time', 'night', 'rippleCount', 'shadowColor', 'highlightColor', 'glowColor'].forEach(function (name) {
      uniforms[name] = gl.getUniformLocation(program, name);
    });
    uniforms.ripples = gl.getUniformLocation(program, 'ripples[0]');
    ready = true;
    toggle.hidden = false;
    canvas.hidden = false;
    canvas.setAttribute('role', 'button');
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', 'Ocean waves. Tap for ripples, drag for a wake, or hold and release for a larger ripple. You can also hold and release Enter or Space.');
    readPalette();
    resize();
    return true;
  }

  function draw() {
    if (!ready || gl.isContextLost()) return;
    // Wake droplets expire sooner than larger ripples; compact in place.
    let active = 0;
    for (let i = 0; i < ripples.length; i++) {
      if (elapsed - ripples[i].born < ripples[i].lifetime) ripples[active++] = ripples[i];
    }
    ripples.length = active;
    ripples.forEach(function (ripple, index) {
      const offset = index * 4;
      rippleData[offset] = ripple.x;
      rippleData[offset + 1] = ripple.z;
      rippleData[offset + 2] = ripple.born;
      rippleData[offset + 3] = ripple.amplitude;
    });
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1i(uniforms.rippleCount, ripples.length);
    gl.uniform4fv(uniforms.ripples, rippleData);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function readPalette() {
    if (!ready) return;
    const style = getComputedStyle(host);
    [['shadowColor', '--water-shadow'], ['highlightColor', '--water-light'], ['glowColor', '--water-glow']].forEach(function (entry) {
      const hex = style.getPropertyValue(entry[1]).trim().replace('#', '');
      gl.uniform3f(uniforms[entry[0]], parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255);
    });
    gl.uniform1f(uniforms.night, document.documentElement.dataset.theme === 'dark' ? 1 : 0);
  }

  function resize() {
    if (!ready) return;
    const bounds = host.getBoundingClientRect();
    // Bound GPU work on large/retina displays while preserving fine grain.
    const pixelBudget = bounds.width < 768 ? 150000 : 420000;
    const scale = Math.min(Math.min(window.devicePixelRatio || 1, 1.5) * 0.65,
      Math.sqrt(pixelBudget / Math.max(1, bounds.width * bounds.height))) * quality;
    canvas.width = Math.max(1, Math.round(bounds.width * scale));
    canvas.height = Math.max(1, Math.round(bounds.height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    draw();
  }

  function tick(now) {
    frame = 0;
    if (!ready || paused || !visible || document.hidden) return;
    if (now - lastTime >= 1000 / 60 - 0.8) {
      const delta = now - lastTime;
      elapsed += Math.min(delta / 1000, 0.1);
      lastTime = now;
      updateWake(now);
      frameDuration += delta;
      frameSamples++;
      if (frameSamples >= 90) {
        if (frameDuration / frameSamples > 22 && quality > 0.55) {
          quality = Math.max(0.55, quality * 0.85);
          resize();
        }
        frameDuration = 0;
        frameSamples = 0;
      }
      draw();
    }
    frame = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = performance.now();
    frameDuration = 0;
    frameSamples = 0;
    toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    toggle.setAttribute('aria-label', paused ? 'Play water animation' : 'Pause water animation');
    draw();
    if (ready && !paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }

  // Sample the same six-wave surface used by the shader's ray march. This is
  // only run on activation, so a ripple starts at the visible wave under the
  // pointer instead of at a flat plane above it.
  function surfaceHeight(x, z) {
    const phase = Math.hypot(x, z) * 0.1;
    const swellLength = Math.hypot(-0.25, 1);
    const swellX = -0.25 / swellLength;
    const swellZ = 1 / swellLength;
    let frequency = 1;
    let speed = 2;
    let weight = 1;
    let sum = 0;
    let weights = 0;
    for (let i = 0; i < 6; i++) {
      const angle = i * 1232.399963;
      let dx = Math.sin(angle) * 0.65 + swellX * 0.35;
      let dz = Math.cos(angle) * 0.65 + swellZ * 0.35;
      const length = Math.hypot(dx, dz);
      dx /= length;
      dz /= length;
      const position = (dx * x + dz * z) * frequency + elapsed * speed + phase;
      const wave = Math.exp(Math.sin(position) - 1);
      x -= dx * wave * Math.cos(position) * weight * 0.38;
      z -= dz * wave * Math.cos(position) * weight * 0.38;
      sum += wave * weight;
      weights += weight;
      weight *= 0.8;
      frequency *= 1.18;
      speed *= 1.07;
    }
    const distance = Math.hypot(x - elapsed * 0.2, z - 1);
    const fade = Math.max(0, Math.min(1, (distance - 4) / 24));
    const swell = Math.sin((x * swellX + z * swellZ) * 0.18 - elapsed * 0.08);
    return sum / weights + swell * (1 - fade * fade * (3 - 2 * fade)) * 0.35 - 1;
  }

  function waterHit(u, v) {
    if (!ready || gl.isContextLost() || u < 0 || u > 1 || v < 0 || v > 1) return null;
    let dx = (u * 2 - 1) * canvas.width / canvas.height;
    const screenY = 1 - v * 2;
    let dy = screenY * Math.cos(cameraTilt) + projectionDepth * Math.sin(cameraTilt);
    let dz = -screenY * Math.sin(cameraTilt) + projectionDepth * Math.cos(cameraTilt);
    const length = Math.hypot(dx, dy, dz);
    dx /= length;
    dy /= length;
    dz /= length;
    if (dy >= -0.015) return null; // Sky and the very distant horizon.
    const originX = elapsed * 0.2;
    const distance = -cameraHeight / dy;
    let x = originX + dx * distance;
    let y = 0;
    let z = 1 + dz * distance;
    let hit = false;
    for (let i = 0; i < 24; i++) {
      const height = surfaceHeight(x, z);
      if (height + 0.01 > y) { hit = true; break; }
      const step = y - height;
      x += dx * step;
      y += dy * step;
      z += dz * step;
    }
    if (!hit) {
      x = originX + dx * distance;
      z = 1 + dz * distance;
    }
    return { x: x, z: z };
  }

  function addRipple(u, v, amplitude = 0.18, render = true) {
    const hit = waterHit(u, v);
    if (!hit) return;
    // While paused (including reduced motion), show a still ripple without
    // restarting playback. Playing again lets it continue naturally.
    ripples.push({ x: hit.x, z: hit.z, born: elapsed - (paused ? 0.2 : 0),
      amplitude: amplitude, lifetime: amplitude < 0.1 ? 1.2 : rippleLifetime });
    if (ripples.length > maxRipples) ripples.shift();
    if (render) draw();
  }

  function releaseStrength(started) {
    return 0.18 + 0.32 * Math.min(1, Math.max(0, (performance.now() - started - 180) / 1500));
  }

  function clearGesture() {
    const previous = gesture;
    gesture = null;
    keyboardHold = null;
    host.classList.remove('water-pressing');
    if (previous && canvas.hasPointerCapture(previous.id)) canvas.releasePointerCapture(previous.id);
  }

  function updateWake(now) {
    if (!gesture || !gesture.dragged || now - gesture.lastEmit < 60) return;
    const distance = Math.hypot(gesture.x - gesture.lastX, gesture.y - gesture.lastY);
    if (distance < 6) return;
    // Interpolate fast strokes, with at most two samples per update. Pointer
    // events only record the newest position; rendering stays on the frame loop.
    const samples = Math.min(2, Math.ceil(distance / 24));
    for (let i = 1; i <= samples; i++) {
      const x = gesture.lastX + (gesture.x - gesture.lastX) * i / samples;
      const y = gesture.lastY + (gesture.y - gesture.lastY) * i / samples;
      addRipple((x - gesture.bounds.left) / gesture.bounds.width,
        (y - gesture.bounds.top) / gesture.bounds.height, 0.045, false);
    }
    gesture.lastX = gesture.x;
    gesture.lastY = gesture.y;
    gesture.lastEmit = now;
    if (paused) draw();
  }

  if (!initialize()) {
    canvas.hidden = true;
    return;
  }
  canvas.addEventListener('pointerdown', function (event) {
    if (!event.isPrimary || event.button !== 0 || gesture) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height || !waterHit((event.clientX - bounds.left) / bounds.width,
      (event.clientY - bounds.top) / bounds.height)) return;
    gesture = { id: event.pointerId, bounds: bounds, started: performance.now(),
      startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY,
      lastX: event.clientX, lastY: event.clientY, lastEmit: 0, dragged: false };
    canvas.setPointerCapture(event.pointerId);
    canvas.focus({ preventScroll: true });
    host.classList.add('water-pressing');
  });
  canvas.addEventListener('pointermove', function (event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    gesture.x = event.clientX;
    gesture.y = event.clientY;
    if (Math.hypot(gesture.x - gesture.startX, gesture.y - gesture.startY) > 8) gesture.dragged = true;
    if (paused) updateWake(performance.now());
  });
  canvas.addEventListener('pointerup', function (event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    gesture.x = event.clientX;
    gesture.y = event.clientY;
    if (Math.hypot(gesture.x - gesture.startX, gesture.y - gesture.startY) > 8) gesture.dragged = true;
    if (gesture.dragged) {
      gesture.lastEmit = 0;
      updateWake(performance.now());
    } else {
      addRipple((gesture.x - gesture.bounds.left) / gesture.bounds.width,
        (gesture.y - gesture.bounds.top) / gesture.bounds.height, releaseStrength(gesture.started));
    }
    clearGesture();
  });
  canvas.addEventListener('pointercancel', clearGesture);
  canvas.addEventListener('lostpointercapture', clearGesture);
  canvas.addEventListener('contextmenu', function (event) { event.preventDefault(); });
  // Assistive-technology activation has no pointer gesture. Ordinary clicks
  // already produced a ripple on pointerup and must not create a second one.
  canvas.addEventListener('click', function (event) {
    if (event.detail === 0) addRipple(0.5, 0.75);
  });
  canvas.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (event.repeat) return;
    keyboardHold = { key: event.key, started: performance.now() };
  });
  canvas.addEventListener('keyup', function (event) {
    if (!keyboardHold || event.key !== keyboardHold.key) return;
    event.preventDefault();
    addRipple(0.5, 0.75, releaseStrength(keyboardHold.started));
    clearGesture();
  });
  canvas.addEventListener('blur', clearGesture);
  window.addEventListener('blur', clearGesture);
  toggle.addEventListener('click', function () { paused = !paused; syncPlayback(); });
  motion.addEventListener('change', function () { paused = motion.matches; syncPlayback(); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearGesture();
    syncPlayback();
  });
  new MutationObserver(function () { readPalette(); draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (!visible) clearGesture();
    syncPlayback();
  }).observe(host);
  canvas.addEventListener('webglcontextlost', function (event) {
    event.preventDefault();
    ready = false;
    clearGesture();
    cancelAnimationFrame(frame);
    toggle.hidden = true;
    canvas.hidden = true;
    canvas.tabIndex = -1;
  });
  canvas.addEventListener('webglcontextrestored', function () {
    if (initialize()) syncPlayback();
  });
  syncPlayback();
  }

  // The biography/navigation are static HTML and paint before GPU setup.
  if ('requestIdleCallback' in window) window.requestIdleCallback(startWater, { timeout: 1000 });
  else requestAnimationFrame(function () { setTimeout(startWater, 0); });
})();

(() => {
  'use strict';

  const surface = document.getElementById('experience');
  const canvas = document.getElementById('light-sea');
  const pauseButton = document.getElementById('pause');
  const pauseLabel = document.getElementById('pause-label');
  const pressureButton = document.getElementById('pressure');
  const pressureLabel = document.getElementById('pressure-label');
  const description = document.getElementById('state-description');
  const cursor = document.getElementById('cursor');
  const gestureInstruction = document.getElementById('gesture-instruction');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const state = {
    paused: motionPreference.matches, held: false, pointerId: null, contextLost: false,
    time: 8.4, pressure: 0, velocity: 0, burst: 0, burstAge: 10,
    x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5,
    lastFrame: 0, frame: 0, width: 1, height: 1,
  };
  let renderer;

  const vertexSource = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `;
  const fragmentSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform vec2 pointer;
    uniform float time;
    uniform float pressure;
    uniform float burst;
    uniform float burstAge;

    vec3 lightColor(float v) {
      vec3 pink = vec3(1.0, 0.443, 0.808);
      vec3 cyan = vec3(0.0, 1.0, 1.0);
      vec3 acid = vec3(0.875, 1.0, 0.0);
      vec3 lilac = vec3(0.859, 0.745, 0.965);
      float k = fract(v) * 4.0;
      if (k < 1.0) return mix(pink, cyan, smoothstep(0.0, 1.0, k));
      if (k < 2.0) return mix(cyan, acid, smoothstep(1.0, 2.0, k));
      if (k < 3.0) return mix(acid, lilac, smoothstep(2.0, 3.0, k));
      return mix(lilac, pink, smoothstep(3.0, 4.0, k));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution;
      float aspect = resolution.x / resolution.y;
      vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
      vec2 mouse = (pointer - 0.5) * vec2(aspect, 1.0);
      float t = time * 0.32;
      vec2 d = p - mouse;
      float local = exp(-length(d) * 3.2);
      p += d * local * (0.2 + pressure * 1.3);

      float r0 = length(p);
      float twist = 0.42 * sin(r0 * 3.0 - t * 0.45) + pressure * (1.7 - r0);
      p = mat2(cos(twist), -sin(twist), sin(twist), cos(twist)) * p;
      float ripple = burst * exp(-burstAge * 1.35);
      p += normalize(p + vec2(0.001)) * sin(r0 * 13.0 - burstAge * 5.5) * ripple * 0.11;

      vec2 q = p;
      for (int i = 0; i < 4; i++) {
        float f = float(i) + 1.0;
        q += (0.16 / f) * sin(q.yx * (3.0 + f * 1.8) + vec2(t * 0.55, -t * 0.4) + f * 1.6);
      }
      float radius = length(q);
      float angle = atan(q.y, q.x);
      float water = q.y * 2.4 + sin(q.x * 3.6 + t * 0.8) * 0.3
        + sin(q.x * 6.8 - t * 0.4 + q.y * 3.0) * 0.12;
      float contour = water * 64.0 + radius * 12.0 + pressure * sin(angle * 5.0) * 2.2;
      float strands = pow(0.5 + 0.5 * sin(contour), 22.0);
      float fine = pow(0.5 + 0.5 * sin(contour * 2.37 + q.x * 11.0), 45.0);
      float glow = pow(0.5 + 0.5 * sin(contour), 3.0);
      float rayPhase = angle * 63.0 + radius * 22.0 - t;
      float rays = pow(0.5 + 0.5 * sin(rayPhase), 65.0);
      float rayGate = smoothstep(0.16, 0.65, radius) * (0.35 + 0.65 * sin(radius * 4.0 + t) * sin(radius * 4.0 + t));
      float vein = pow(0.5 + 0.5 * sin(q.x * 21.0 - q.y * 17.0 + sin(q.y * 9.0) * 2.0 + t), 36.0);
      vec3 hue = lightColor(water * 0.63 + angle * 0.21 + t * 0.032);
      vec3 hue2 = lightColor(radius * 0.85 - angle * 0.16 - t * 0.04 + 0.4);
      vec3 color = vec3(0.025, 0.0, 0.048);
      color += hue * (strands * 0.8 + glow * 0.13 + fine * 0.22);
      color += hue2 * rays * rayGate * 0.78;
      color += lightColor(q.x * 0.3 + t * 0.02 + 0.65) * vein * 0.19;
      color += hue * local * 0.05;
      float centerVoid = smoothstep(0.025, 0.34, radius);
      color *= 0.25 + centerVoid * 0.75;
      float vignette = 1.0 - smoothstep(0.25, 1.1, length((uv - 0.5) * vec2(1.0, 0.85))) * 0.65;
      color *= vignette;
      color += vec3(0.075, 0.008, 0.105) * (1.0 - centerVoid);
      color *= 0.85 + pressure * 0.22 + ripple * 0.16;
      // Continuous light; no strobe or rapid whole-screen brightness changes.
      color = pow(max(color, vec3(0.0)), vec3(0.91));
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function createWebGLRenderer() {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl) return null;
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(message || 'No se pudo compilar la luz.');
      }
      return shader;
    }
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(['resolution', 'pointer', 'time', 'pressure', 'burst', 'burstAge'].map(name => [name, gl.getUniformLocation(program, name)]));
    surface.classList.add('has-webgl');
    return {
      resize() { gl.viewport(0, 0, canvas.width, canvas.height); },
      draw() {
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        gl.uniform2f(uniforms.pointer, state.x, 1 - state.y);
        gl.uniform1f(uniforms.time, state.time);
        gl.uniform1f(uniforms.pressure, state.pressure);
        gl.uniform1f(uniforms.burst, state.burst);
        gl.uniform1f(uniforms.burstAge, state.burstAge);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      },
    };
  }

  function createCanvasRenderer() {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return { resize() {}, draw() {} };
    const colors = ['#FF71CE', '#00FFFF', '#DFFF00', '#dbbef6'];
    return {
      resize() {},
      draw() {
        const w = canvas.width, h = canvas.height, t = state.time * 0.35;
        ctx.fillStyle = '#09000e';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'screen';
        for (let line = 0; line < 80; line++) {
          ctx.beginPath();
          ctx.strokeStyle = colors[line % colors.length];
          ctx.globalAlpha = line % 5 === 0 ? 0.75 : 0.28;
          ctx.lineWidth = line % 5 === 0 ? 1.5 : 0.7;
          for (let step = 0; step <= 90; step++) {
            const x = step / 90 * w;
            const n = x / w;
            const influence = Math.exp(-Math.abs(n - state.x) * 6);
            const y = line / 80 * h + Math.sin(n * 7 + t + line * 0.14) * h * 0.12
              + Math.sin(n * 18 - t * 0.7 + line * 0.15) * h * (0.035 + state.pressure * influence * 0.09);
            if (step === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      },
    };
  }

  function initializeRenderer() {
    try { renderer = createWebGLRenderer() || createCanvasRenderer(); }
    catch (error) {
      console.warn('Se usa la versión alternativa del mar de luz.', error.message);
      surface.classList.remove('has-webgl');
      renderer = { resize() {}, draw() {} };
    }
    resize();
  }

  function resize() {
    state.width = surface.clientWidth;
    state.height = surface.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1600000 / (state.width * state.height)));
    canvas.width = Math.max(1, Math.round(state.width * ratio));
    canvas.height = Math.max(1, Math.round(state.height * ratio));
    renderer.resize();
    draw();
  }

  function draw() {
    if (!state.contextLost) renderer.draw();
    const p = state.pressure;
    const breathe = motionPreference.matches ? 0 : Math.sin(state.time * 0.42);
    surface.style.setProperty('--pressure', p.toFixed(3));
    surface.style.setProperty('--tx', `${((state.x - 0.5) * -19 + breathe * 3).toFixed(2)}px`);
    surface.style.setProperty('--ty', `${((state.y - 0.5) * -12 + Math.cos(state.time * 0.31) * 3).toFixed(2)}px`);
    surface.style.setProperty('--tilt', `${(-6 + breathe * 1.1 + p * -3).toFixed(2)}deg`);
    surface.style.setProperty('--tear', `${(Math.sin(state.time * 1.7) * 5 + p * Math.sin(state.time * 3) * 68).toFixed(2)}px`);
    surface.style.setProperty('--charge-scale', (1 + p * 0.035).toFixed(3));
    surface.style.setProperty('--ring', (201 * (1 - p)).toFixed(1));
    const label = state.paused ? 'PAUSADO' : state.held && p > 0.65 ? 'SUELTA' : 'MANTÉN PULSADO';
    if (pressureLabel.textContent !== label) pressureLabel.textContent = label;
  }

  function tick(timestamp) {
    state.frame = 0;
    if (state.paused || document.hidden || state.contextLost) return;
    const dt = state.lastFrame ? Math.min((timestamp - state.lastFrame) / 1000, 0.045) : 1 / 60;
    state.lastFrame = timestamp;
    state.time += dt;
    state.burstAge += dt;
    state.x += (state.targetX - state.x) * (1 - Math.exp(-dt * 5));
    state.y += (state.targetY - state.y) * (1 - Math.exp(-dt * 5));
    const target = state.held ? 1 : 0;
    state.velocity += ((target - state.pressure) * 26 - state.velocity * 9) * dt;
    state.pressure = Math.max(0, Math.min(1, state.pressure + state.velocity * dt));
    draw();
    requestTick();
  }

  function requestTick() {
    if (!state.frame && !state.paused && !document.hidden && !state.contextLost) state.frame = requestAnimationFrame(tick);
  }

  function setPaused(paused, announce = true) {
    state.paused = paused;
    state.held = false;
    state.pointerId = null;
    state.lastFrame = 0;
    surface.classList.toggle('paused', paused);
    surface.classList.remove('charging');
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseLabel.textContent = paused ? 'Reanudar' : 'Pausar';
    pressureButton.setAttribute('aria-disabled', String(paused));
    if (announce) description.textContent = paused ? 'Animación pausada.' : 'Animación en movimiento.';
    if (paused) {
      cancelAnimationFrame(state.frame);
      state.frame = 0;
      surface.classList.remove('pointer-active');
      draw();
    } else requestTick();
  }

  function press() {
    if (state.paused) return;
    state.held = true;
    surface.classList.add('charging');
  }

  function release() {
    if (!state.held) return;
    state.held = false;
    state.burst = Math.max(0.15, state.pressure);
    state.burstAge = 0;
    surface.classList.remove('charging');
  }

  function updatePointer(event) {
    if (state.paused) return;
    const bounds = surface.getBoundingClientRect();
    state.targetX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    state.targetY = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    if (event.pointerType === 'mouse' && finePointer.matches) {
      surface.classList.add('pointer-active');
      cursor.style.left = `${event.clientX - bounds.left}px`;
      cursor.style.top = `${event.clientY - bounds.top}px`;
      cursor.style.transform = 'translate(-50%,-50%)';
    }
  }

  pauseButton.addEventListener('click', () => setPaused(!state.paused));
  surface.addEventListener('pointermove', updatePointer, { passive: true });
  surface.addEventListener('pointerdown', event => {
    if (event.button !== 0 || state.paused || state.pointerId !== null || event.target.closest('a, #pause')) return;
    updatePointer(event);
    state.pointerId = event.pointerId;
    surface.setPointerCapture(event.pointerId);
    press();
  });
  const endPointer = event => {
    if (event.pointerId !== state.pointerId) return;
    state.pointerId = null;
    release();
  };
  surface.addEventListener('pointerup', endPointer);
  surface.addEventListener('pointercancel', endPointer);
  surface.addEventListener('lostpointercapture', endPointer);
  surface.addEventListener('pointerleave', () => surface.classList.remove('pointer-active'));
  pressureButton.addEventListener('click', event => {
    // Native keyboard and assistive activation receives the same visible effect.
    if (event.detail === 0 && !state.paused) {
      state.pressure = 0.85;
      state.velocity = 0;
      state.burst = 0.85;
      state.burstAge = 0;
      requestTick();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.code === 'Escape' && !event.repeat) {
      event.preventDefault();
      setPaused(!state.paused);
    }
    if (event.code === 'Space' && !event.target.closest('a, #pause')) {
      event.preventDefault();
      if (!event.repeat) press();
    }
  });
  document.addEventListener('keyup', event => {
    if (event.code === 'Space') { event.preventDefault(); release(); }
  });
  window.addEventListener('blur', () => { state.pointerId = null; release(); });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    state.lastFrame = 0;
    state.pointerId = null;
    release();
    if (document.hidden) { cancelAnimationFrame(state.frame); state.frame = 0; }
    else requestTick();
  });
  motionPreference.addEventListener('change', event => setPaused(event.matches));
  function updateInstruction() {
    gestureInstruction.textContent = finePointer.matches ? 'Mueve el cursor.' : 'Desliza el dedo.';
  }
  finePointer.addEventListener('change', updateInstruction);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    state.contextLost = true;
    cancelAnimationFrame(state.frame);
    state.frame = 0;
    surface.classList.remove('has-webgl');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    state.contextLost = false;
    initializeRenderer();
    requestTick();
  });

  updateInstruction();
  initializeRenderer();
  setPaused(state.paused, false);
})();

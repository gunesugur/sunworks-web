import { prefersReducedMotion } from './reduced-motion';

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

// Halftone field: every cell draws one dot whose radius follows the light at its centre.
const FRAG = `precision mediump float;
uniform vec2 uRes;uniform float uTime;uniform float uRise;uniform float uCell;
uniform vec2 uMouse;uniform float uMouseOn;uniform vec3 uBg;uniform vec3 uFg;uniform vec3 uAccent;
const float H=.34;const float R=.29;
float sun(vec2 p,vec2 c){
  float d=distance(p,c);
  float body=1.-smoothstep(R-.015,R+.012,d);
  float rings=.5+.5*sin(d*34.-uTime*1.5);
  float glow=exp(-(d-R)*4.2)*.62*rings*step(R,d);
  return max(body,glow);
}
void main(){
  vec2 frag=gl_FragCoord.xy;
  vec2 cell=(floor(frag/uCell)+.5)*uCell;
  vec2 p=cell/uRes.y;
  float aspect=uRes.x/uRes.y;
  vec2 c=vec2(aspect*.5,H+mix(-.46,.015,uRise)+.012*sin(uTime*.55));
  float v;
  if(p.y>=H){v=sun(p,c);}
  else{
    vec2 q=vec2(p.x+.018*sin(p.y*70.+uTime*1.8),2.*H-p.y);
    v=sun(q,c)*.8*smoothstep(0.,H,p.y)*(.65+.35*sin(p.y*120.-uTime*2.4));
  }
  float md=distance(p,uMouse);
  v=max(v,uMouseOn*.8*exp(-md*md*30.));
  v=clamp(v,0.,1.);
  float rad=uCell*.5*sqrt(v);
  float dist=distance(frag,cell);
  float dotA=1.-smoothstep(rad-.9,rad+.5,dist);
  float speck=(1.-smoothstep(.8,1.5,dist))*.1;
  vec3 dotCol=mix(mix(uBg,uFg,.55),uAccent,smoothstep(.08,.5,v));
  vec3 col=mix(uBg,uFg,speck);
  col=mix(col,dotCol,dotA);
  float line=1.-smoothstep(.5,1.3,abs(frag.y-H*uRes.y));
  col=mix(col,uFg,line*.75);
  gl_FragColor=vec4(col,1.);
}`;

const rgb = (css: string): [number, number, number] => {
  const m = css.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  // Chrome reports color-mix()/oklab results as "oklab(...)"; everything the tokens use resolves to rgb here.
  return [(m[0] ?? 0) / 255, (m[1] ?? 0) / 255, (m[2] ?? 0) / 255];
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
}

/** Starts the hero sun. Returns a cleanup; does nothing without WebGL. */
export function startSun(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-sun-canvas]');
  const gl = canvas?.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!canvas || !gl) return () => undefined;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return () => undefined;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => undefined;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const U = {
    res: u('uRes'),
    time: u('uTime'),
    rise: u('uRise'),
    cell: u('uCell'),
    mouse: u('uMouse'),
    mouseOn: u('uMouseOn'),
    bg: u('uBg'),
    fg: u('uFg'),
    accent: u('uAccent'),
  };

  const still = prefersReducedMotion();
  const probeFg = root.querySelector<HTMLElement>('.sun__probe--fg');
  const probeAccent = root.querySelector<HTMLElement>('.sun__probe--accent');
  const readColours = () => {
    gl.uniform3fv(U.bg, rgb(getComputedStyle(root).backgroundColor));
    if (probeFg) gl.uniform3fv(U.fg, rgb(getComputedStyle(probeFg).color));
    if (probeAccent) gl.uniform3fv(U.accent, rgb(getComputedStyle(probeAccent).color));
  };

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(root.clientWidth * dpr);
    canvas.height = Math.round(root.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.cell, 9 * dpr);
    if (!running) draw(performance.now());
  };

  const t0 = performance.now();
  let riseStart = 0;
  let mouse = { x: -1, y: -1 };
  let mouseOn = 0;
  let mouseTarget = 0;
  let visible = false;
  let running = false;
  let frame = 0;

  const draw = (now: number) => {
    const t = still ? 0 : (now - t0) / 1000;
    const k = riseStart ? Math.min(1, (now - riseStart) / 2600) : 0;
    const rise = still ? 1 : 1 - (1 - k) ** 3;
    mouseOn += (mouseTarget - mouseOn) * 0.08;
    gl.uniform1f(U.time, t);
    gl.uniform1f(U.rise, rise);
    gl.uniform2f(U.mouse, mouse.x, mouse.y);
    gl.uniform1f(U.mouseOn, mouseOn);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now: number) => {
    draw(now);
    frame = running ? requestAnimationFrame(loop) : 0;
  };
  const setRunning = (on: boolean) => {
    if (still) return;
    running = on && visible && !document.hidden;
    if (running && !frame) frame = requestAnimationFrame(loop);
  };

  const onMove = (e: PointerEvent) => {
    const r = root.getBoundingClientRect();
    mouse = { x: (e.clientX - r.left) / r.height, y: (r.bottom - e.clientY) / r.height };
    mouseTarget = 1;
    if (still) draw(performance.now());
  };
  const onLeave = () => (mouseTarget = 0);
  const onVisibility = () => setRunning(true);
  const themeObserver = new MutationObserver(() => {
    readColours();
    if (!running) draw(performance.now());
  });

  const io = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible && !riseStart) riseStart = performance.now();
    setRunning(true);
  });
  const ro = new ResizeObserver(resize);

  readColours();
  resize();
  draw(performance.now());
  root.classList.add('is-live');
  io.observe(root);
  ro.observe(root);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-contrast'] });
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    io.disconnect();
    ro.disconnect();
    themeObserver.disconnect();
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}

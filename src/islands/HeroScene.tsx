import { onCleanup, onMount } from 'solid-js';
import { HERO_FRAG, createFullscreenProgram } from '../lib/shaders';
import { prefersReducedMotion } from '../lib/browser';

/**
 * HeroScene — WebGL flow-shader base + lightweight 2D flow-field lines.
 * Perf budget: coarse-pointer/mobile renders the shader at DPR 1 and 30fps
 * with no 2D overlay; desktop renders full rate. Pauses offscreen, honors
 * reduced motion, single static paint when motion is reduced.
 */
export default function HeroScene() {
  let glCanvas!: HTMLCanvasElement;
  let lineCanvas!: HTMLCanvasElement;

  onMount(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const reduced = prefersReducedMotion();
    const coarse =
      window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    let raf = 0;
    let visible = true;
    let lastFrame = 0;
    let mx = 0.5;
    let my = 0.42;

    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / Math.max(1, r.width);
      my = 1 - (e.clientY - r.top) / Math.max(1, r.height);
    };
    hero.addEventListener('pointermove', onMove, { passive: true });

    const io = new IntersectionObserver((es) => (visible = es[0]?.isIntersecting ?? true));
    io.observe(hero);

    // --- WebGL base ---
    let gl: WebGLRenderingContext | null = null;
    let prog: ReturnType<typeof createFullscreenProgram> = null;
    const start = performance.now();
    try {
      gl = glCanvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
      if (gl) prog = createFullscreenProgram(gl, HERO_FRAG);
    } catch {
      gl = null;
    }

    const resizeGL = () => {
      const r = hero.getBoundingClientRect();
      // DPR 1 on touch/mobile: shader cost scales with pixels (~2.2x cheaper)
      const dpr = coarse ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.max(2, Math.floor(r.width * dpr));
      const h = Math.max(2, Math.floor(r.height * dpr));
      if (glCanvas.width !== w || glCanvas.height !== h) {
        glCanvas.width = w;
        glCanvas.height = h;
      }
      gl?.viewport(0, 0, w, h);
    };
    resizeGL();
    window.addEventListener('resize', resizeGL);

    // --- 2D flow lines overlay (desktop only) ---
    const ctx = coarse ? null : lineCanvas.getContext('2d');
    if (coarse) lineCanvas.style.display = 'none';
    type P = { x: number; y: number; s: number; o: number };
    let parts: P[] = [];
    const resizeLines = () => {
      if (coarse) return;
      const r = hero.getBoundingClientRect();
      lineCanvas.width = Math.floor(r.width);
      lineCanvas.height = Math.floor(r.height);
      const n = Math.min(110, Math.floor(r.width / 12));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * lineCanvas.width,
        y: Math.random() * lineCanvas.height,
        s: Math.random() * 1.8 + 0.4,
        o: Math.random() * Math.PI * 2,
      }));
    };
    resizeLines();
    window.addEventListener('resize', resizeLines);

    const paint = (now: number) => {
      const t = (now - start) / 1000;
      const W = lineCanvas.width || 2;
      const H = lineCanvas.height || 2;

      if (gl && prog) {
        gl.uniform2f(prog.loc.u_res, glCanvas.width, glCanvas.height);
        gl.uniform1f(prog.loc.u_time, t);
        gl.uniform2f(prog.loc.u_mouse, mx, my);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (ctx && !coarse) {
        // flow lines driven by the same clock
        const tt = t * 0.9;
        ctx.clearRect(0, 0, W, H);
        ctx.lineWidth = 1;
        const mxx = mx * W;
        const myy = (1 - my) * H;
        for (const p of parts) {
          const a = Math.sin(p.x * 0.008 + tt + p.o) * 1.4 + Math.cos(p.y * 0.008 - tt) * 1.4;
          const nx = p.x + Math.cos(a) * 2.2 + (mx - 0.5) * 2;
          const ny = p.y + Math.sin(a) * 2.2 + (0.5 - my) * 2;
          const dx = mxx - p.x;
          const dy = myy - p.y;
          const d = Math.hypot(dx, dy);
          const glow = Math.max(0, 1 - d / 380);
          ctx.strokeStyle =
            d < 380
              ? `rgba(233,168,37,${(0.12 + glow * 0.5).toFixed(3)})`
              : `rgba(255,255,255,${(0.05 + p.s * 0.04).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          p.x = nx;
          p.y = ny;
          if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
            p.x = Math.random() * W;
            p.y = Math.random() * H;
          }
        }
      }
    };

    const frame = (now: number) => {
      if (visible && !document.hidden) {
        // Ambient mode (see Ambient island): sleep while body.is-idle so the
        // viewport settles for Speed Index; input wakes it instantly.
        // Coarse devices also render on a 30fps cadence to stay off long tasks.
        const asleep = document.body.classList.contains('is-idle');
        if (!asleep && (!coarse || now - lastFrame >= 33)) {
          lastFrame = now;
          paint(now);
        }
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    // initial paint ASAP so LCP never waits on the loop
    paint(performance.now());
    lastFrame = performance.now();
    if (!reduced) raf = requestAnimationFrame(frame);

    onCleanup(() => {
      cancelAnimationFrame(raf);
      io.disconnect();
      hero.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resizeGL);
      window.removeEventListener('resize', resizeLines);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    });
  });

  return (
    <>
      <canvas id="heroGL" ref={glCanvas!} aria-hidden="true" />
      <canvas id="flow" ref={lineCanvas!} aria-hidden="true" />
    </>
  );
}

import { onCleanup, onMount } from 'solid-js';
import { HERO_FRAG, createFullscreenProgram } from '../lib/shaders';
import { prefersReducedMotion } from '../lib/browser';

/**
 * HeroScene — WebGL flow-shader base + lightweight 2D flow-field lines.
 * Pauses offscreen, respects reduced-motion, DPR-capped for perf.
 */
export default function HeroScene() {
  let glCanvas!: HTMLCanvasElement;
  let lineCanvas!: HTMLCanvasElement;

  onMount(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const reduced = prefersReducedMotion();
    let raf = 0;
    let visible = true;
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
    let start = performance.now();
    try {
      gl = glCanvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
      if (gl) prog = createFullscreenProgram(gl, HERO_FRAG);
    } catch {
      gl = null;
    }

    const resizeGL = () => {
      const r = hero.getBoundingClientRect();
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
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

    // --- 2D flow lines overlay ---
    const ctx = lineCanvas.getContext('2d');
    type P = { x: number; y: number; s: number; o: number };
    let parts: P[] = [];
    const resizeLines = () => {
      const r = hero.getBoundingClientRect();
      lineCanvas.width = Math.floor(r.width);
      lineCanvas.height = Math.floor(r.height);
      const n = Math.min(150, Math.floor(r.width / 10));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * lineCanvas.width,
        y: Math.random() * lineCanvas.height,
        s: Math.random() * 1.8 + 0.4,
        o: Math.random() * Math.PI * 2,
      }));
    };
    resizeLines();
    window.addEventListener('resize', resizeLines);

    let t = 0;
    const frame = () => {
      if (visible && !document.hidden) {
        t += 0.008;
        const W = lineCanvas.width;
        const H = lineCanvas.height;

        if (gl && prog) {
          const el = performance.now() - start;
          gl.uniform2f(prog.loc.u_res, glCanvas.width, glCanvas.height);
          gl.uniform1f(prog.loc.u_time, el / 1000);
          gl.uniform2f(prog.loc.u_mouse, mx, my);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        } else {
          // CPU fallback wash
          const g = ctx;
          if (g) {
            g.fillStyle = '#0A0A0B';
            g.fillRect(0, 0, W, H);
          }
        }

        if (ctx) {
          ctx.clearRect(0, 0, W, H);
          ctx.lineWidth = 1;
          const mxx = mx * W;
          const myy = (1 - my) * H;
          for (const p of parts) {
            const a = Math.sin(p.x * 0.008 + t + p.o) * 1.4 + Math.cos(p.y * 0.008 - t) * 1.4;
            const nx = p.x + Math.cos(a) * 2.2 + (mx - 0.5) * 2;
            const ny = p.y + Math.sin(a) * 2.2 + (0.5 - my) * 2;
            const dx = mxx - p.x;
            const dy = myy - p.y;
            const d = Math.hypot(dx, dy);
            const glow = Math.max(0, 1 - d / 380);
            ctx.strokeStyle =
              d < 380
                ? `rgba(214,255,63,${(0.12 + glow * 0.5).toFixed(3)})`
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
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    if (reduced) {
      // single static paint
      frame();
    } else {
      raf = requestAnimationFrame(frame);
    }

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

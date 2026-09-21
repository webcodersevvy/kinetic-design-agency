import { onCleanup, onMount } from 'solid-js';
import { CTA_FRAG, createFullscreenProgram } from '../lib/shaders';
import { prefersReducedMotion } from '../lib/browser';

export default function CtaShader() {
  let cv!: HTMLCanvasElement;
  onMount(() => {
    if (prefersReducedMotion()) return;
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    const prog = createFullscreenProgram(gl, CTA_FRAG);
    if (!prog) return;
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver((es) => (visible = es[0]?.isIntersecting ?? true), { threshold: 0 });
    io.observe(cv);
    const resize = () => {
      const r = cv.parentElement?.getBoundingClientRect();
      if (!r) return;
      cv.width = Math.max(2, Math.floor(r.width / 2));
      cv.height = Math.max(2, Math.floor(r.height / 2));
      gl.viewport(0, 0, cv.width, cv.height);
    };
    resize();
    window.addEventListener('resize', resize);
    const t0 = performance.now();
    const loop = () => {
      if (visible) {
        gl.uniform2f(prog.loc.u_res, cv.width, cv.height);
        gl.uniform1f(prog.loc.u_time, (performance.now() - t0) / 1000);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    onCleanup(() => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
    });
  });
  return <canvas id="ctaGL" ref={cv!} aria-hidden="true" />;
}

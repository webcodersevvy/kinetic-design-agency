import { onCleanup, onMount } from 'solid-js';
import { prefersReducedMotion } from '../lib/browser';

const IDLE_MS = 4000;

/**
 * Ambient — global idle detector. After 8s without input the page is marked
 * `body.is-idle`: perpetual motion (marquees, pulses, canvas, clocks) sleeps
 * so the viewport settles; the next input wakes everything instantly.
 */
export default function Ambient() {
  onMount(() => {
    let last = performance.now();
    let idle = false;
    let raf = 0;

    const poke = () => {
      last = performance.now();
      if (idle) {
        idle = false;
        document.body.classList.remove('is-idle');
      }
    };
    const events = ['pointerdown', 'pointermove', 'wheel', 'keydown', 'touchstart'] as const;
    events.forEach((t) => window.addEventListener(t, poke, { passive: true }));

    if (prefersReducedMotion()) {
      idle = true;
      document.body.classList.add('is-idle');
    }

    const loop = () => {
      if (!idle && performance.now() - last > IDLE_MS) {
        idle = true;
        document.body.classList.add('is-idle');
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    onCleanup(() => {
      cancelAnimationFrame(raf);
      events.forEach((t) => window.removeEventListener(t, poke));
    });
  });
  return null;
}

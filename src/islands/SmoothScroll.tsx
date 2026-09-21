import { onCleanup, onMount } from 'solid-js';
import 'lenis/dist/lenis.css';

/**
 * Lenis 1.3 setup: `autoRaf` runs the internal rAF loop, `anchors` handles
 * in-page anchor links natively, and `respectReducedMotion` (default true)
 * disables smoothing for reduced-motion users while keeping scroll sync alive.
 * ScrollTrigger is synced per the official Lenis + GSAP pattern.
 */
export default function SmoothScroll() {
  onMount(() => {
    let cancelled = false;
    let lenis: { destroy: () => void } | null = null;

    (async () => {
      const [{ default: Lenis }, { ensureGsap }] = await Promise.all([
        import('lenis'),
        import('../lib/browser'),
      ]);
      if (cancelled) return;

      const instance = new Lenis({
        lerp: 0.11,
        smoothWheel: true,
        anchors: true,
        autoRaf: true,
      });
      lenis = instance;

      try {
        const { ScrollTrigger } = await ensureGsap();
        if (!cancelled && ScrollTrigger) {
          instance.on('scroll', () => ScrollTrigger.update());
        }
      } catch {
        /* ScrollTrigger is optional — Lenis smooth scroll works standalone */
      }
    })();

    onCleanup(() => {
      cancelled = true;
      lenis?.destroy();
    });
  });
  return null;
}

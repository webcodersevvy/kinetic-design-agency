import { onCleanup, onMount } from 'solid-js';
import { prefersReducedMotion } from '../lib/browser';

/**
 * MotionStage — pinned 100vh scroll-cinema band. Giant type rows counter-scroll,
 * the glow field scales and a badge spins, all scrubbed to scroll progress.
 */
export default function MotionStage() {
  onMount(() => {
    if (prefersReducedMotion()) return;
    let killed = false;
    let ctx: { revert: () => void } | null = null;

    (async () => {
      try {
        const { ensureGsap } = await import('../lib/browser');
        const { gsap, ScrollTrigger } = await ensureGsap();
        if (killed || !ScrollTrigger) return;

        ctx = gsap.context(() => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: '#motion-stage',
              start: 'top top',
              end: '+=220%',
              scrub: 1,
              pin: true,
            },
          });
          tl.to('.mrow-1', { xPercent: -16, ease: 'none' }, 0)
            .to('.mrow-2', { xPercent: 14, ease: 'none' }, 0)
            .to('.mrow-3', { xPercent: -10, ease: 'none' }, 0)
            .fromTo('.mstage-bg', { scale: 1.18, rotate: -2 }, { scale: 1, rotate: 2, ease: 'none' }, 0)
            .fromTo('.mstage-badge', { rotate: 0, scale: 0.8 }, { rotate: 200, scale: 1.1, ease: 'none' }, 0)
            .fromTo('.mstage-inner', { filter: 'saturate(.8)' }, { filter: 'saturate(1.25)', ease: 'none' }, 0);
        });
        ScrollTrigger.refresh();
      } catch {
        /* static stage fallback */
      }
    })();

    onCleanup(() => {
      killed = true;
      try {
        ctx?.revert();
      } catch {
        /* noop */
      }
    });
  });
  return null;
}

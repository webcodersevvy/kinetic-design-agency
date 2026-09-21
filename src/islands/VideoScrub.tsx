import { onCleanup, onMount } from 'solid-js';
import { prefersReducedMotion } from '../lib/browser';

/**
 * Scroll-driven video scrubbing: scroll position drives video.currentTime.
 * Uses an open CC0 sample so no build asset is required.
 */
export default function VideoScrub() {
  let video!: HTMLVideoElement;
  let bar!: HTMLDivElement;

  onMount(() => {
    let st: { kill: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { ensureGsap } = await import('../lib/browser');
        const { gsap, ScrollTrigger } = await ensureGsap();
        if (cancelled || !ScrollTrigger) return;
        const setDur = () => {
          const d = Number.isFinite(video.duration) ? video.duration : 0;
          if (d <= 0) return;
          const obj = { t: 0 };
          const tween = gsap.to(obj, {
            t: d,
            ease: 'none',
            scrollTrigger: {
              trigger: '#videoScrub',
              start: 'top 85%',
              end: 'bottom 35%',
              scrub: 0.6,
              onUpdate: (self) => {
                try {
                  video.currentTime = obj.t;
                } catch { /* noop */ }
                if (bar) bar.style.transform = `scaleX(${self.progress})`;
              },
            },
          });
          st = { kill: () => tween.scrollTrigger?.kill() };
        };
        if (video.readyState >= 1) setDur();
        else video.addEventListener('loadedmetadata', setDur, { once: true });
      } catch { /* static video fallback */ }
    })();
    if (prefersReducedMotion()) {
      video.pause();
    }
    onCleanup(() => {
      cancelled = true;
      st?.kill();
    });
  });

  return (
    <div id="videoScrub" style={{ 'margin-top': '18px' }}>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          'border-radius': '18px',
          border: '1px solid var(--line)',
          background: '#000',
        }}
      >
        <video
          ref={video!}
          muted
          playsinline
          preload="auto"
          poster="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80&auto=format&fit=crop"
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          style={{ width: '100%', height: 'min(46vw, 300px)', 'object-fit': 'cover', display: 'block' }}
          aria-label="Scroll-scrubbed motion study"
        />
        <span class="scrub-hint">Scroll to scrub ▸ motion study 001</span>
      </div>
      <div
        aria-hidden="true"
        style={{ height: '2px', background: 'rgba(255,255,255,.14)', 'border-radius': '100px', 'margin-top': '10px' }}
      >
        <div
          ref={bar!}
          style={{
            height: '100%',
            background: 'var(--lime)',
            transform: 'scaleX(0)',
            'transform-origin': 'left',
            'border-radius': '100px',
          }}
        />
      </div>
    </div>
  );
}

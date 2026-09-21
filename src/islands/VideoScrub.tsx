import { createSignal, onCleanup, onMount } from 'solid-js';
import { prefersReducedMotion } from '../lib/browser';

const POSTER = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=70&auto=format&fit=crop';
const SRC = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

/**
 * Scroll-driven video scrubbing: scroll position drives video.currentTime.
 * The 1.1MB video never blocks initial load — the element mounts only after
 * browser idle and uses preload="metadata" (duration only) until scrubbed.
 */
export default function VideoScrub() {
  let video!: HTMLVideoElement;
  let bar!: HTMLDivElement;
  const [ready, setReady] = createSignal(false);

  onMount(() => {
    const schedule = (cb: () => void) =>
      'requestIdleCallback' in window
        ? (window as Window & { requestIdleCallback: (c: () => void, o?: object) => number }).requestIdleCallback(() => cb(), { timeout: 2500 })
        : setTimeout(cb, 1500);
    const id = schedule(() => setReady(true));

    let st: { kill: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const { ensureGsap } = await import('../lib/browser');
        const { gsap, ScrollTrigger } = await ensureGsap();
        if (cancelled || !ScrollTrigger) return;
        const setup = () => {
          if (!video || cancelled) return;
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
                } catch {
                  /* noop */
                }
                if (bar) bar.style.transform = `scaleX(${self.progress})`;
              },
            },
          });
          st = { kill: () => tween.scrollTrigger?.kill() };
        };
        // wait for the video element (mounts on idle) before wiring metadata
        const wait = setInterval(() => {
          if (cancelled) {
            clearInterval(wait);
            return;
          }
          if (video) {
            clearInterval(wait);
            if (video.readyState >= 1) setup();
            else video.addEventListener('loadedmetadata', setup, { once: true });
          }
        }, 300);
        onCleanup(() => clearInterval(wait));
      } catch {
        /* static video fallback */
      }
    })();
    if (prefersReducedMotion()) {
      video?.pause();
    }
    onCleanup(() => {
      cancelled = true;
      if (typeof id === 'number') {
        try {
          (window as Window & { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(id);
        } catch {
          clearTimeout(id);
        }
      }
      st?.kill();
    });
  });

  const boxStyle = {
    position: 'relative',
    overflow: 'hidden',
    'border-radius': '18px',
    border: '1px solid var(--line)',
    background: '#000',
  } as const;
  const mediaStyle = {
    width: '100%',
    height: 'min(46vw, 300px)',
    'object-fit': 'cover',
    display: 'block',
  } as const;

  return (
    <div id="videoScrub" style={{ 'margin-top': '18px' }}>
      <div style={boxStyle}>
        {ready() ? (
          <video
            ref={video!}
            muted
            playsinline
            preload="metadata"
            poster={POSTER}
            src={SRC}
            style={mediaStyle}
            aria-label="Scroll-scrubbed motion study"
          />
        ) : (
          <img src={POSTER} alt="Motion study preview" loading="lazy" decoding="async" style={mediaStyle} />
        )}
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

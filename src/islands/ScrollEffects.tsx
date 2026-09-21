import { onCleanup, onMount } from 'solid-js';
import { inView, animate } from 'motion';
import { prefersReducedMotion } from '../lib/browser';

/** Motion-driven count-up (tweened single value). */
function runCountUp(el: HTMLElement) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const end = Number(el.dataset.count || '0');
  animate(0, end, {
    duration: 1.4,
    ease: [0.16, 1, 0.3, 1],
    onUpdate: (v) => {
      el.textContent = String(Math.round(v));
    },
  });
}

function revealCounts(el: Element) {
  el.querySelectorAll('[data-count]').forEach((n) => runCountUp(n as HTMLElement));
  if ((el as HTMLElement).hasAttribute('data-count')) runCountUp(el as HTMLElement);
}

/**
 * ScrollEffects — Motion owns scroll-*triggered* micro-interactions
 * (reveals via `inView`, count-ups, magnetic release springs);
 * GSAP ScrollTrigger owns scrubbed scroll *cinema* (hero zoom, parallax,
 * 3D stacking, horizontal track, theme fading, video scrub, marquee skew).
 */
export default function ScrollEffects() {
  onMount(() => {
    let killed = false;
    let ctx: { revert: () => void } | null = null;
    const stops: Array<() => void> = [];

    // ---- reveals + counters (Motion inView; fires once on enter) ----
    document.querySelectorAll('.reveal').forEach((el) => {
      stops.push(
        inView(
          el as HTMLElement,
          () => {
            el.classList.add('in');
            revealCounts(el);
          },
          { amount: 0.2 },
        ),
      );
    });
    document.querySelectorAll('[data-count]').forEach((el) => {
      if ((el as HTMLElement).closest('.reveal')) return;
      stops.push(
        inView(
          el as HTMLElement,
          () => runCountUp(el as HTMLElement),
          { amount: 0.6 },
        ),
      );
    });

    // ---- manifesto word split (progressive enhancement) ----
    const mani = document.getElementById('maniText');
    if (mani && !mani.dataset.split) {
      mani.dataset.split = '1';
      mani.innerHTML = mani.innerHTML
        .split(/(<[^>]+>|\s+)/g)
        .map((tok) => (!tok.trim() || tok.startsWith('<') ? tok : `<span class="w">${tok}</span>`))
        .join('');
    }

    // ---- magnetic: direct follow on move, Motion spring on release ----
    const mags = Array.from(document.querySelectorAll<HTMLElement>('.magnetic'));
    const magClean: Array<() => void> = [];
    mags.forEach((el) => {
      const mv = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * 0.18).toFixed(1)}px)`;
      };
      const lv = () => {
        const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform);
        const sx = m ? Number(m[1]) : 0;
        const sy = m ? Number(m[2]) : 0;
        el.style.transform = '';
        if (sx || sy) animate(el, { x: [sx, 0], y: [sy, 0] }, { type: 'spring', stiffness: 260, damping: 22 });
      };
      el.addEventListener('pointermove', mv);
      el.addEventListener('pointerleave', lv);
      magClean.push(() => {
        el.removeEventListener('pointermove', mv);
        el.removeEventListener('pointerleave', lv);
      });
    });

    if (prefersReducedMotion()) {
      mani?.querySelectorAll('.w').forEach((w) => w.classList.add('on'));
      return () => {
        stops.forEach((fn) => fn());
        magClean.forEach((fn) => fn());
      };
    }

    (async () => {
      try {
        const { ensureGsap } = await import('../lib/browser');
        const { gsap, ScrollTrigger } = await ensureGsap();
        if (killed || !ScrollTrigger) return;

        ctx = gsap.context(() => {
          // 1) Sticky zoom hero reveal (deferred render: nothing is written
          // to the hero until scroll progress actually moves)
          const title = document.querySelector('.hero-title');
          const inner = document.querySelector('.hero-inner');
          if (title) {
            gsap.to(title, {
              scale: 1.12,
              yPercent: -8,
              filter: 'blur(2px)',
              opacity: 0.25,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
            });
          }
          if (inner) {
            gsap.to(inner, {
              y: -60,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.8 },
            });
          }

          // 2) Multi-layer parallax depth
          gsap.to('.hero-glow', {
            yPercent: 18,
            ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
          });
          gsap.to('.hero-grid', {
            yPercent: 32,
            ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
          });
          gsap.utils.toArray<HTMLElement>('.cap-visual img').forEach((img) => {
            gsap.fromTo(img, { yPercent: -10 }, { yPercent: 10, ease: 'none',
              scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 1 } });
          });
          const nycImg = document.querySelector('.nyc-card.map img');
          if (nycImg) {
            gsap.fromTo(nycImg, { yPercent: -8 }, { yPercent: 8, ease: 'none',
              scrollTrigger: { trigger: '.nyc-card.map', start: 'top bottom', end: 'bottom top', scrub: 1 } });
          }
          gsap.utils.toArray<HTMLElement>('.proj .proj-art').forEach((art) => {
            gsap.fromTo(art, { yPercent: -6 }, { yPercent: 6, ease: 'none',
              scrollTrigger: { trigger: art.closest('.proj') as Element, start: 'top bottom', end: 'bottom top', scrub: 1 } });
          });

          // 3) Layered 3D card entrances (work) — no positional overlap:
          // cards keep their grid rhythm (gap 30px) while tilting in.
          gsap.utils.toArray<HTMLElement>('.work-grid .proj').forEach((card) => {
            gsap.fromTo(card,
              { transformPerspective: 1100, rotateX: 4, y: 40, scale: 0.985 },
              { rotateX: 0, y: 0, scale: 1, ease: 'none',
                scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 45%', scrub: 0.7 } });
          });

          // 4) Horizontal scroll — process steps on desktop
          const mm = gsap.matchMedia();
          mm.add('(min-width: 1021px)', () => {
            const viewport = document.querySelector('.hscroll-viewport');
            const track = document.querySelector('.hscroll-track') as HTMLElement | null;
            if (!viewport || !track) return;
            const getX = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
            const tween = gsap.to(track, {
              x: () => -getX(),
              ease: 'none',
              scrollTrigger: {
                trigger: viewport,
                start: 'top 78%',
                end: () => `+=${getX() + 200}`,
                scrub: 0.8,
                pin: false,
                invalidateOnRefresh: true,
              },
            });
            return () => tween.scrollTrigger?.kill();
          });

          // CTA grade shift on scroll
          const cta = document.querySelector('.cta-box');
          if (cta) {
            gsap.fromTo(cta, { filter: 'saturate(.85) brightness(.97)' },
              { filter: 'saturate(1.15) brightness(1.02)', ease: 'none',
                scrollTrigger: { trigger: cta, start: 'top 90%', end: 'top 40%', scrub: 1 } });
          }

          // Manifesto words scrub
          const words = mani?.querySelectorAll('.w');
          if (words?.length) {
            gsap.to(words, {
              opacity: 1,
              stagger: 0.06,
              ease: 'none',
              scrollTrigger: { trigger: '#studio', start: 'top 75%', end: 'center 40%', scrub: 0.6 },
              onComplete: () => words.forEach((w) => w.classList.add('on')),
            });
          }

          // Generic parallax for floating badges
          gsap.utils.toArray<HTMLElement>('.orbit').forEach((o, i) => {
            gsap.to(o, { y: i === 0 ? -24 : 24, rotation: i === 0 ? -12 : 10, ease: 'none',
              scrollTrigger: { trigger: o, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
          });
        });
      } catch {
        mani?.querySelectorAll('.w').forEach((w) => w.classList.add('on'));
      }
    })();

    onCleanup(() => {
      killed = true;
      stops.forEach((fn) => fn());
      magClean.forEach((fn) => fn());
      try { ctx?.revert(); } catch { /* noop */ }
    });
  });
  return null;
}

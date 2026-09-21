import { onCleanup, onMount } from 'solid-js';

/**
 * HeaderTheme — inverts fixed-header chrome (logo, pill nav, live clock, burger)
 * to match the contrast of whatever section scrolls beneath it.
 * Sections opt in via `data-tone="light" | "dark"`.
 */
export default function HeaderTheme() {
  onMount(() => {
    const header = document.querySelector('header');
    if (!header) return;
    let ticking = false;
    let mode = '';

    const update = () => {
      ticking = false;
      const bands = Array.from(document.querySelectorAll('[data-tone]'));
      // topmost band containing the header line (72px from viewport top)
      let tone = 'dark';
      for (const el of bands) {
        const r = (el as HTMLElement).getBoundingClientRect();
        if (r.top <= 72 && r.bottom > 72) tone = (el as HTMLElement).dataset.tone || 'dark';
        if (r.top > 72) break;
      }
      const next = tone === 'light' ? 'on-light' : 'on-dark';
      if (next !== mode) {
        mode = next;
        if (next === 'on-light') header.setAttribute('data-mode', 'on-light');
        else header.removeAttribute('data-mode');
      }
    };
    const request = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    onCleanup(() => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    });
  });
  return null;
}

import { onCleanup, onMount } from 'solid-js';

/** Observe visibility once, run callback. */
export function useInViewOnce(ref: () => HTMLElement | undefined, cb: () => void, threshold = 0.2) {
  onMount(() => {
    const el = ref();
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      cb();
      return;
    }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (cb(), io.disconnect())),
      { threshold },
    );
    io.observe(el);
    onCleanup(() => io.disconnect());
  });
}

/** NYC clock hook — returns stop function. Updates all [data-nyc-clock] nodes. */
export function useNycClock() {
  onMount(() => {
    const fmt = (d: Date) => {
      try {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(d);
      } catch {
        return d.toLocaleTimeString();
      }
    };
    const tick = () => {
      const t = fmt(new Date());
      document.querySelectorAll('[data-clock-full]').forEach((n) => (n.textContent = t));
      document.querySelectorAll('[data-clock-hero]').forEach((n) => (n.textContent = `${t} EST`));
      document.querySelectorAll('[data-clock-nav]').forEach((n) => (n.textContent = `NYC ${t.slice(0, 5)}`));
    };
    tick();
    const id = setInterval(tick, 1000);
    onCleanup(() => clearInterval(id));
  });
}

import { onCleanup, onMount } from 'solid-js';

export default function Cursor() {
  let dot!: HTMLDivElement;
  let ring!: HTMLDivElement;
  let label!: HTMLSpanElement;

  onMount(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    let mx = innerWidth / 2;
    let my = innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(loop);

    const hovers = Array.from(document.querySelectorAll('[data-hover]'));
    const views = Array.from(document.querySelectorAll('[data-cursor]'));
    const onH = () => ring.classList.add('is-hover');
    const offH = () => ring.classList.remove('is-hover');
    const onV = (el: Element) => () => {
      label.textContent = (el as HTMLElement).dataset.cursor || 'View';
      ring.classList.add('is-view');
    };
    const offV = () => ring.classList.remove('is-view');

    hovers.forEach((el) => {
      el.addEventListener('pointerenter', onH);
      el.addEventListener('pointerleave', offH);
    });
    const cleanV: Array<() => void> = [];
    views.forEach((el) => {
      const a = onV(el);
      el.addEventListener('pointerenter', a);
      el.addEventListener('pointerleave', offV);
      cleanV.push(() => {
        el.removeEventListener('pointerenter', a);
        el.removeEventListener('pointerleave', offV);
      });
    });

    onCleanup(() => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
      hovers.forEach((el) => {
        el.removeEventListener('pointerenter', onH);
        el.removeEventListener('pointerleave', offH);
      });
      cleanV.forEach((fn) => fn());
    });
  });

  return (
    <>
      <div class="cursor-dot" ref={dot!} aria-hidden="true" />
      <div class="cursor-ring" ref={ring!} aria-hidden="true">
        <span ref={label!}>View</span>
      </div>
    </>
  );
}

import { onCleanup, onMount } from 'solid-js';
import { animate } from 'motion';

/** Motion-tweened preloader progress (single-value tween with onUpdate). */
export default function Preloader() {
  let fill!: HTMLDivElement;
  let pct!: HTMLSpanElement;
  let pre!: HTMLDivElement;

  onMount(() => {
    const controls = animate(0, 100, {
      duration: 1.8,
      ease: 'easeInOut',
      onUpdate: (v) => {
        fill.style.transform = `scaleX(${v / 100})`;
        pct.textContent = `${Math.floor(v)}%`;
      },
      onComplete: () => {
        pre.classList.add('done');
        setTimeout(() => pre.remove(), 900);
      },
    });
    // hard cap: never trap the user behind the loader
    const cap = setTimeout(() => {
      controls.stop();
      pre.classList.add('done');
      setTimeout(() => pre.remove(), 900);
    }, 6000);
    onCleanup(() => {
      clearTimeout(cap);
      controls.stop();
    });
  });

  return (
    <div id="preloader" ref={pre!} aria-hidden="true">
      <div class="pre-logo">
        KINETIC<i>®</i>
      </div>
      <div class="pre-bar">
        <div class="pre-fill" ref={fill!} id="preFill" />
      </div>
      <div class="pre-meta">
        <span>NYC — 40.7128°N / 74.0060°W</span>
        <span ref={pct!} id="prePct">
          0%
        </span>
      </div>
    </div>
  );
}

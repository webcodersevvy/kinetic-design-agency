import { For, createSignal, onMount } from 'solid-js';
import { artNumeral, paletteVars } from '../lib/palettes';

export type WorkCard = {
  slug: string;
  title: string;
  tag: string;
  tagDark: string;
  excerpt: string;
  categories: string[];
  /** stable art index (palette + numeral) */
  art: number;
};

export default function WorkGrid(props: { items: WorkCard[] }) {
  const [filter, setFilter] = createSignal('all');
  const shown = () => props.items.filter((p) => filter() === 'all' || p.categories.includes(filter()));

  const tilt = (el: HTMLElement) => {
    let raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(1100px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateZ(0)`;
      });
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  };

  onMount(() => {
    const cleanups = Array.from(document.querySelectorAll<HTMLElement>('.proj')).map(tilt);
    return () => cleanups.forEach((fn) => fn());
  });

  const filters: Array<[string, string]> = [
    ['all', `All / ${String(props.items.length).padStart(2, '0')}`],
    ['branding', 'Branding'],
    ['motion', 'Motion'],
    ['web', 'Interactive'],
  ];

  return (
    <>
      <div class="filters" style={{ 'margin-top': '14px' }} role="tablist" aria-label="Filter work">
        <For each={filters}>
          {([v, label]) => (
            <button
              class={filter() === v ? 'active' : ''}
              data-hover
              data-filter={v}
              onClick={() => setFilter(v)}
              role="tab"
              aria-selected={filter() === v}
            >
              {label}
            </button>
          )}
        </For>
      </div>
      <div class="work-grid" id="workGrid">
        <For each={shown()}>
          {(p) => (
            <article class="proj in" data-cat={p.categories.join(' ')} data-cursor="View case" style={paletteVars(p.art)}>
              <div class="proj-art" aria-hidden="true">
                <span class="proj-num">{artNumeral(p.art)}</span>
              </div>
              <div class="proj-top">
                <span class="tag">{p.tag}</span>
                <span class="tag dark">{p.tagDark}</span>
              </div>
              <a
                class="proj-info"
                href={`/work/${p.slug}/`}
                aria-label={`${p.title} — view case`}
                style={{ color: 'inherit', 'text-decoration': 'none' }}
              >
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                </div>
                <span class="proj-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </article>
          )}
        </For>
      </div>
    </>
  );
}

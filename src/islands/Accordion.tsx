import { For, createSignal, onMount } from 'solid-js';

export type AccEntry = { title: string; body: string; tags: string[]; meta: [string, string, string] };

const DEFAULTS: AccEntry[] = [
  {
    title: 'Naming & Identity',
    body: 'Names that stick and marks that move. Wordmarks, systems and guidelines drawn motion-first, so the logo behaves on screen one as well as it sits on paper.',
    tags: ['Naming', 'Wordmarks', 'Guidelines', 'Voice & tone'],
    meta: ['From $18k', 'Weeks 4–6', '→ 36 identities'],
  },
  {
    title: 'Film & Animation',
    body: 'Launch films, title design, explainers and loops with a grade you can recognize blind. Boards to final mix, all in-house.',
    tags: ['Launch films', 'Titles', 'Explain­ers', 'Loops & Lottie'],
    meta: ['From $14k', 'Weeks 3–5', '→ 90+ films'],
  },
  {
    title: 'Web & Interactive',
    body: 'Storefronts, campaign sites and real-time visual engines. Designed and built by the same nineteen people, on a CMS you will actually enjoy.',
    tags: ['Storefronts', 'Real-time', 'E-commerce', 'Design systems'],
    meta: ['From $24k', 'Weeks 5–8', '→ 40+ launches'],
  },
  {
    title: '3D & CGI',
    body: 'Product renders, world-building and full-CG sets. A small render farm, strong opinions about light, and previews while you wait.',
    tags: ['Product CGI', 'Worlds', 'Virtual sets', 'Stills'],
    meta: ['From $16k', 'Weeks 3–6', '→ Millions of pixels'],
  },
];

export default function Accordion(props: { items?: AccEntry[] }) {
  const items = () => props.items?.length ? props.items : DEFAULTS;
  const [open, setOpen] = createSignal(0);
  let bodies: HTMLDivElement[] = [];

  const sync = () => {
    bodies.forEach((b, i) => {
      if (!b) return;
      b.style.maxHeight = i === open() ? `${b.scrollHeight}px` : '0px';
    });
  };

  onMount(() => {
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  });

  return (
    <div class="acc reveal in" id="acc">
      <For each={items()}>
        {(item, i) => (
          <div class={i() === open() ? 'acc-item open' : 'acc-item'}>
            <button
              class="acc-head"
              data-hover
              aria-expanded={i() === open()}
              onClick={() => {
                setOpen(i() === open() ? -1 : i());
                requestAnimationFrame(sync);
              }}
            >
              <span class="num">0{i() + 1}</span>
              <h3>{item.title}</h3>
              <span class="plus">+</span>
            </button>
            <div class="acc-body" ref={(el) => (bodies[i()] = el)}>
              <div class="acc-body-inner">
                <p>{item.body}</p>
                <ul>
                  <For each={item.tags}>{(t) => <li>{t}</li>}</For>
                </ul>
                <div class="row">
                  <span>{item.meta[0]}</span>
                  <span>{item.meta[1]}</span>
                  <b>{item.meta[2]}</b>
                </div>
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}

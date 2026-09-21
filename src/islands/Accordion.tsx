import { For, createSignal, onMount } from 'solid-js';

export type AccEntry = { title: string; body: string; tags: string[]; meta: [string, string, string] };

const DEFAULTS: AccEntry[] = [
  {
    title: 'Brand Identity',
    body: 'Logos that flex, systems that scale. Naming, visual identity, guidelines and toolkits built motion-first from day one.',
    tags: ['Naming', 'Logo & type', 'Guidelines', 'Art direction'],
    meta: ['From $25k', 'Timeline 4–6 weeks', '→ 48 brands'],
  },
  {
    title: 'Motion & Animation',
    body: 'Launch films, title sequences, explainers, loops and broadcast packages. 2D, cel, mixed-media — board to final mix.',
    tags: ['Launch films', 'Titles', 'Explainers', 'Lottie / Loops'],
    meta: ['From $18k', 'Timeline 3–5 weeks', '→ 120+ films'],
  },
  {
    title: 'Web & Interactive',
    body: 'Awwwards-grade marketing sites, e-comm and WebGL experiences. Design + creative dev in-house, CMS you’ll actually use.',
    tags: ['Creative dev', 'WebGL / Shaders', 'E-commerce', 'Design systems'],
    meta: ['From $30k', 'Timeline 5–8 weeks', '→ 9× SOTD'],
  },
  {
    title: '3D & CGI',
    body: 'Product renders, world-building, simulations and virtual sets. Octane / Houdini pipeline with real-time previews.',
    tags: ['Product CGI', 'Houdini FX', 'Virtual sets', 'AR filters'],
    meta: ['From $20k', 'Timeline 3–6 weeks', '→ 80M renders'],
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

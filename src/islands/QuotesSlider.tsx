import { For, createEffect, createSignal, on, onCleanup, onMount } from 'solid-js';
import { animate } from 'motion';

export type Quote = { quote: string; name: string; role: string; avatar: string };

const FALLBACK: Quote[] = [
  {
    quote: '“Kinetic turned our launch into a short film our customers quote back to us. Then thirty-one million of them <span>watched it.</span>”',
    name: 'Dana Whitfield — CMO, Velvetline',
    role: 'Velvetline “Full Sprint” — 2026',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop',
  },
  {
    quote: '“Boards on Monday, <span>moving pictures by Friday.</span> Nobody performs process here.”',
    name: 'Marcus Oyelaran — Founder, Coppr',
    role: 'Coppr identity — 2025',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&auto=format&fit=crop',
  },
  {
    quote: '“One visual language across our app, our ads and our stage. <span>Sign-ups up forty percent.</span>”',
    name: 'Sofia Marchetti — Head of Brand, Orbit FM',
    role: 'Orbit visuals engine — 2025',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop',
  },
];

export default function QuotesSlider(props: { items?: Quote[] }) {
  const data = () => (props.items?.length ? props.items : FALLBACK);
  const [idx, setIdx] = createSignal(0);
  const show = (k: number) => setIdx((k + data().length) % data().length);
  let quoteEl!: HTMLDivElement;

  // Motion slide/fade on every quote change (skips initial mount)
  createEffect(
    on(idx, (_, prev) => {
      if (prev === undefined || !quoteEl) return;
      animate(quoteEl, { opacity: [0, 1], x: [-16, 0] }, { duration: 0.45, ease: 'easeOut' });
    }),
  );

  onMount(() => {
    const id = setInterval(() => show(idx() + 1), 7000);
    const prev = () => show(idx() - 1);
    const next = () => show(idx() + 1);
    document.addEventListener('quote:prev', prev);
    document.addEventListener('quote:next', next);
    onCleanup(() => {
      clearInterval(id);
      document.removeEventListener('quote:prev', prev);
      document.removeEventListener('quote:next', next);
    });
  });

  const q = () => data()[idx()];
  return (
    <div class="quote-box reveal in">
      <div ref={quoteEl!}>
        <blockquote id="qText" innerHTML={q().quote} />
        <div class="quote-person">
          <img id="qImg" src={q().avatar} alt="" loading="lazy" />
          <div>
            <b id="qName">{q().name}</b>
            <small id="qRole">{q().role}</small>
          </div>
        </div>
        <div class="dots" id="qDots" aria-hidden="true">
          <For each={data()}>{(_, i) => <i class={i() === idx() ? 'on' : ''} />}</For>
        </div>
      </div>
      <div class="quote-side">
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&auto=format&fit=crop"
          alt="Studio premiere night"
          loading="lazy"
        />
      </div>
    </div>
  );
}

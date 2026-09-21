import { For, createEffect, createSignal, on, onCleanup, onMount } from 'solid-js';
import { animate } from 'motion';

export type Quote = { quote: string; name: string; role: string; avatar: string };

const FALLBACK: Quote[] = [
  {
    quote: '“Kinetic took a 40-slide deck and turned it into a launch film our whole company cried at. Then the internet watched it <span>48 million times.</span>”',
    name: 'Maya Chen — VP Brand, Nike NYC',
    role: 'Air Max “Neon Pulse” — 2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop',
  },
  {
    quote: '“Fastest senior team we’ve ever worked with. Boards on Monday, <span>moving pixels by Friday.</span> No agency theatre.”',
    name: 'Jonas Reid — Founder, Halcyon',
    role: 'Full rebrand + motion system — 2025',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop',
  },
  {
    quote: '“They think in systems, not deliverables. Our site, our ads, our app — <span>one kinetic language.</span> Conversion up 64%.”',
    name: 'Priya Nair — CMO, Ritual',
    role: 'Ritual.com + CGI — 2025',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop',
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
          alt="Kinetic launch event"
          loading="lazy"
        />
      </div>
    </div>
  );
}

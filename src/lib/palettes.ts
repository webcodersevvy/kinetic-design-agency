// Per-card generative-art palettes for the Selected Work grid.
// Single source shared by the landing WorkGrid island and /work index.

export type Palette = { a: string; b: string; c: string };

export const palettes: Palette[] = [
  { a: '#e8442e', b: '#e9a825', c: '#1c0f0a' }, // 01 Full Sprint — ember / gold
  { a: '#e9a825', b: '#7aa088', c: '#141007' }, // 02 Coppr — gold / fern
  { a: '#7aa088', b: '#e8442e', c: '#0d1512' }, // 03 Orbit — fern / ember
  { a: '#e8442e', b: '#f4efe3', c: '#170d0a' }, // 04 Harbor — ember / paper
  { a: '#e9a825', b: '#e8442e', c: '#151006' }, // 05 Fieldday — gold / ember
  { a: '#7aa088', b: '#e9a825', c: '#0e130f' }, // 06 Mesa — fern / gold
];

/** Inline custom-property string consumed by .proj-art CSS. */
export function paletteVars(i: number): string {
  const p = palettes[((i % palettes.length) + palettes.length) % palettes.length];
  return `--p1:${p.a};--p2:${p.b};--p3:${p.c}`;
}

/** Display numeral for card art, e.g. 0 -> "01". */
export function artNumeral(i: number): string {
  return String(i + 1).padStart(2, '0');
}

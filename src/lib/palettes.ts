// Per-card generative-art palettes for the Selected Work grid.
// Single source shared by the landing WorkGrid island and /work index.

export type Palette = { a: string; b: string; c: string };

export const palettes: Palette[] = [
  { a: '#d6ff3f', b: '#7b5cff', c: '#101014' }, // 01 Neon Pulse — lime / violet
  { a: '#3fd9ff', b: '#7b5cff', c: '#0c1420' }, // 02 Halcyon — cyan / violet
  { a: '#ff3fa4', b: '#ff4d00', c: '#160d12' }, // 03 Canvas — magenta / orange
  { a: '#7b5cff', b: '#3fd9ff', c: '#0d0d1a' }, // 04 Midnight — violet / cyan
  { a: '#ff4d00', b: '#d6ff3f', c: '#161006' }, // 05 Ritual — orange / lime
  { a: '#ffb300', b: '#3fd9ff', c: '#12100a' }, // 06 Arc — amber / cyan
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

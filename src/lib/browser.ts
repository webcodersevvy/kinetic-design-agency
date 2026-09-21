// Shared browser helpers: reduced motion, gsap lazy loader, lenis types.

export const isBrowser = () => typeof window !== 'undefined';

export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isDesktopQuery(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia('(min-width: 1021px)').matches;
}

export async function ensureGsap() {
  const [gsapMod, stMod] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  const gsap = gsapMod.gsap ?? gsapMod.default ?? (gsapMod as unknown as typeof import('gsap').gsap);
  const ScrollTrigger =
    (stMod as unknown as { ScrollTrigger?: typeof import('gsap/ScrollTrigger').ScrollTrigger }).ScrollTrigger ??
    (stMod as unknown as { default?: typeof import('gsap/ScrollTrigger').ScrollTrigger }).default;
  if (ScrollTrigger && !(gsap as unknown as { __st?: boolean }).__st) {
    gsap.registerPlugin(ScrollTrigger);
    (gsap as unknown as { __st?: boolean }).__st = true;
  }
  return { gsap, ScrollTrigger };
}

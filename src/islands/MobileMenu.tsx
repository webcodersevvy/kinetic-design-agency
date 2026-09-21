import { onCleanup, onMount } from 'solid-js';

export default function MobileMenu() {
  onMount(() => {
    const burger = document.getElementById('burger');
    const mmenu = document.getElementById('mmenu');
    if (!burger || !mmenu) return;
    const toggle = () => mmenu.classList.toggle('open');
    const close = () => mmenu.classList.remove('open');
    burger.addEventListener('click', toggle);
    mmenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);

    // active pill link from current pathname (navlinks are page routes)
    const links = Array.from(document.querySelectorAll('.pill-nav a'));
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    links.forEach((a) => {
      const href = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
      if (href !== '/' && (path === href || path.startsWith(`${href}/`))) {
        a.classList.add('active');
      }
    });

    onCleanup(() => {
      burger.removeEventListener('click', toggle);
      window.removeEventListener('keydown', onKey);
    });
  });
  return null;
}

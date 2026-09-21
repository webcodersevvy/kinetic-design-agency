import { onCleanup, onMount } from 'solid-js';

export default function ShowreelModal() {
  onMount(() => {
    const modal = document.getElementById('reelModal');
    const frame = document.getElementById('reelFrame') as HTMLIFrameElement | null;
    const play = document.getElementById('playBtn');
    const closeBtn = document.getElementById('modalClose');
    const bg = document.getElementById('modalBg');
    if (!modal || !frame || !play) return;
    const open = () => {
      modal.classList.add('open');
      frame.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
    };
    const close = () => {
      modal.classList.remove('open');
      frame.src = '';
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    play.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    bg?.addEventListener('click', close);
    window.addEventListener('keydown', onKey);
    onCleanup(() => {
      play.removeEventListener('click', open);
      closeBtn?.removeEventListener('click', close);
      bg?.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    });
  });
  return null;
}

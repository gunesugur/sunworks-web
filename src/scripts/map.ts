export function initMap(): () => void {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-map-load]')];
  const handlers = buttons.map((btn) => {
    const onClick = () => {
      const src = btn.dataset['src'];
      const holder = btn.closest<HTMLElement>('[data-map]');
      if (!src || !holder || !src.startsWith('https://www.openstreetmap.org/')) return;
      const frame = document.createElement('iframe');
      frame.src = src;
      frame.title = btn.dataset['title'] ?? 'Map';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer';
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      holder.replaceChildren(frame);
      frame.focus();
    };
    btn.addEventListener('click', onClick);
    return () => btn.removeEventListener('click', onClick);
  });
  return () => handlers.forEach((off) => off());
}

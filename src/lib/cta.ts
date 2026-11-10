import { ctaClick } from './store';

// Un único listener para todos los botones [data-cta] de los slides y videos
export function iniciarCtaDelegado(): void {
  const w = window as any;
  if (w.__hexacutCta) return;
  w.__hexacutCta = true;
  document.addEventListener('click', (e) => {
    const boton = (e.target as Element).closest<HTMLElement>('[data-cta]');
    if (boton?.dataset.cta) {
      const packId = boton.dataset.pack || 'pack-1';
      ctaClick(boton.dataset.cta, packId);
    }
  });
}

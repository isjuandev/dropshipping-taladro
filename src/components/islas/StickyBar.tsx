import { useState, useEffect } from 'preact/hooks';
import { currentPack, ctaClick } from '../../lib/store';
import { formatCOP } from '../../config/tienda';

interface StickyBarProps {
  thumbnailUrl?: string;
}

export default function StickyBar({ thumbnailUrl = '/og-image.jpg' }: StickyBarProps) {
  const [visible, setVisible] = useState(false);
  const pack = currentPack.value;

  useEffect(() => {
    const heroEl = document.getElementById('hero');
    const pedidoEl = document.getElementById('pedido');

    let heroPassed = false;
    let pedidoInView = false;

    const updateVisibility = () => {
      setVisible(heroPassed && !pedidoInView);
    };

    const heroObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Cuando el hero deja de intersectar (sale de la pantalla hacia arriba)
        heroPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        updateVisibility();
      },
      { threshold: 0.1 }
    );

    const pedidoObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        pedidoInView = entry.isIntersecting;
        updateVisibility();
      },
      { threshold: 0.05 }
    );

    if (heroEl) heroObserver.observe(heroEl);
    if (pedidoEl) pedidoObserver.observe(pedidoEl);

    // Listener de scroll de respaldo para navegadores móviles con barra dinámica
    const handleScroll = () => {
      if (heroEl) {
        const heroBottom = heroEl.getBoundingClientRect().bottom;
        heroPassed = heroBottom < 100;
      }
      if (pedidoEl) {
        const pedidoRect = pedidoEl.getBoundingClientRect();
        pedidoInView = pedidoRect.top < window.innerHeight && pedidoRect.bottom > 0;
      }
      updateVisibility();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (heroEl) heroObserver.unobserve(heroEl);
      if (pedidoEl) pedidoObserver.unobserve(pedidoEl);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      class="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-hierro)]/95 backdrop-blur-md border-t border-gray-700/80 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-2xl transition-all md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div class="flex items-center justify-between gap-3">
        {/* Miniatura y datos del pack */}
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-11 h-11 rounded-lg bg-[var(--color-acero)] border border-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={thumbnailUrl}
              alt="Cortadora de Lámina"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="truncate">
            <div class="text-[11px] font-bold text-gray-300 uppercase tracking-wide truncate">
              {pack.nombre}
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-base font-extrabold text-white font-['JetBrains_Mono'] nums-tabular">
                {formatCOP(pack.precio)}
              </span>
              <span class="text-[10px] text-[var(--color-exito)] font-medium">
                Envío gratis
              </span>
            </div>
          </div>
        </div>

        {/* Botón CTA */}
        <button
          type="button"
          onClick={() => ctaClick('sticky')}
          class="h-11 px-5 rounded-lg bg-[var(--color-naranja)] hover:bg-[var(--color-naranja-hover)] text-[var(--color-tinta)] font-bold text-base font-['Barlow_Condensed'] uppercase tracking-wider shrink-0 shadow-md active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
        >
          <span>Pedir ahora</span>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

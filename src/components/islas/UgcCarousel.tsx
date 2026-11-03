import { useEffect, useRef, useState } from 'preact/hooks';
import type { UgcItem } from '../../config/tienda';
import { registrarVideoPlay } from '../../lib/tracking';

interface Props {
  items: UgcItem[];
}

export default function UgcCarousel({ items }: Props) {
  const pista = useRef<HTMLUListElement>(null);
  const [reducirMovimiento, setReducirMovimiento] = useState(false);
  const [puedeIr, setPuedeIr] = useState({ atras: false, adelante: true });

  const actualizar = () => {
    const el = pista.current;
    if (!el) return;
    setPuedeIr({
      atras: el.scrollLeft > 4,
      adelante: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  };

  const mover = (direccion: -1 | 1) => {
    const el = pista.current;
    if (!el) return;
    const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: reducir ? 'auto' : 'smooth' });
  };

  // Los videos solo cargan (y suenan a play) al llegar a su tarjeta
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    actualizar();
    const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducirMovimiento(reducir);
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            if (!v.getAttribute('src')) v.src = v.dataset.src!;
            if (!reducir) {
              v.play().then(() => registrarVideoPlay(v.dataset.id!)).catch(() => {});
            }
          } else {
            v.pause();
          }
        }
      },
      { root: el, threshold: 0.6 }
    );
    el.querySelectorAll('video').forEach((v) => observador.observe(v));
    return () => observador.disconnect();
  }, []);

  return (
    <section id="clientes" class="bg-[var(--color-acero)] text-white py-8" aria-roledescription="carrusel" aria-label="Clientes reales">
      <div class="relative mx-auto w-full max-w-[560px]">
        <h2 class="sr-only">Clientes reales</h2>
        <ul
          ref={pista}
          onScroll={actualizar}
          tabIndex={0}
          aria-label="Fotos y videos de clientes"
          class="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar px-4 list-none m-0 focus-visible:outline-2 focus-visible:outline-[var(--color-naranja)]"
        >
          {items.map((it) => (
            <li key={it.id} class="snap-center shrink-0 w-[78%]">
              <div class="relative aspect-[4/5] rounded-[12px] overflow-hidden bg-[var(--color-hierro)]">
                {it.tipo === 'video' ? (
                  <video
                    data-id={it.id}
                    data-src={it.src}
                    poster={it.poster}
                    muted
                    loop
                    playsInline
                    preload="none"
                    controls={reducirMovimiento}
                    aria-label={it.alt}
                    class="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={it.src}
                    alt={it.alt}
                    loading="lazy"
                    decoding="async"
                    class="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
              <div class="mt-2 flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-sm font-bold truncate">{it.nombre}</div>
                  <div class="text-xs text-gray-300 truncate">{it.ciudad}</div>
                </div>
                <div class="flex text-[var(--color-chispa)]" role="img" aria-label={`${it.estrellas} estrellas de 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <svg key={n} class={`w-4 h-4 ${n <= it.estrellas ? 'fill-current' : 'fill-gray-600'}`} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => mover(-1)}
              disabled={!puedeIr.atras}
              aria-label="Anterior"
              class="absolute left-1 top-[38%] -translate-y-1/2 w-11 h-11 rounded-full bg-[var(--color-acero)]/85 border border-gray-500 text-white text-xl flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => mover(1)}
              disabled={!puedeIr.adelante}
              aria-label="Siguiente"
              class="absolute right-1 top-[38%] -translate-y-1/2 w-11 h-11 rounded-full bg-[var(--color-acero)]/85 border border-gray-500 text-white text-xl flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
}

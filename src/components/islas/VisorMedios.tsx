import { useEffect, useRef } from 'preact/hooks';
import type { MedioCliente } from '../../lib/clientes';
import { registrarVideoPlay } from '../../lib/tracking';

interface Props {
  medios: MedioCliente[];
  indice: number;
  onCerrar: () => void;
  onNavegar: (indice: number) => void;
}

function Estrellas({ valor }: { valor: number }) {
  return (
    <span
      class="flex items-center text-[var(--color-chispa)]"
      role="img"
      aria-label={`${valor} estrellas de 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          class={`w-4 h-4 ${n <= valor ? 'fill-current' : 'fill-gray-600'}`}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </span>
  );
}

// Visor a pantalla completa para ver la foto o el video (con sonido) que envió el cliente.
export default function VisorMedios({ medios, indice, onCerrar, onNavegar }: Props) {
  const medio = medios[indice];
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const total = medios.length;

  // Bloquea el scroll del fondo y lleva el foco al botón de cerrar
  useEffect(() => {
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cerrarRef.current?.focus();
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, []);

  // Navegación con teclado
  useEffect(() => {
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar();
      if (evento.key === 'ArrowRight') onNavegar((indice + 1) % total);
      if (evento.key === 'ArrowLeft') onNavegar((indice - 1 + total) % total);
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [indice, total]);

  if (!medio) return null;

  const etiqueta = medio.tipo === 'video' ? 'Video' : 'Foto';

  return (
    <div
      class="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${etiqueta} de ${medio.nombre}`}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
        <span class="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gray-300">
          {etiqueta} {indice + 1} de {total}
        </span>
        <button
          ref={cerrarRef}
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          class="w-10 h-10 shrink-0 rounded-full border border-white/25 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>

      <div class="relative flex-1 min-h-0 flex items-center justify-center px-2 py-3 sm:px-8">
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => onNavegar((indice - 1 + total) % total)}
              aria-label="Anterior"
              class="absolute left-1 sm:left-3 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/25 bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onNavegar((indice + 1) % total)}
              aria-label="Siguiente"
              class="absolute right-1 sm:right-3 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/25 bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {medio.tipo === 'video' ? (
          <video
            key={medio.id}
            class="max-h-full max-w-full rounded-[10px] bg-black"
            src={medio.src}
            poster={medio.poster}
            controls
            autoPlay
            playsInline
            onPlay={() => registrarVideoPlay(medio.id)}
          />
        ) : (
          <img
            key={medio.id}
            class="max-h-full max-w-full rounded-[10px] object-contain"
            src={medio.src}
            alt={medio.alt}
            decoding="async"
          />
        )}
      </div>

      <div class="max-h-[42vh] overflow-y-auto border-t border-white/10 bg-black/60 px-4 py-4">
        <div class="mx-auto w-full max-w-2xl">
          <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p class="m-0 text-base font-bold text-white">
              {medio.nombre} <span class="font-normal text-gray-400">· {medio.ciudad}</span>
            </p>
            <Estrellas valor={medio.estrellas} />
          </div>
          <p class="mt-2 mb-0 text-[15px] leading-relaxed text-gray-200">{medio.texto}</p>
        </div>
      </div>
    </div>
  );
}

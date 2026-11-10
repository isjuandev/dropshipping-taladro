import { useState } from 'preact/hooks';
import { ctaClick } from '../../lib/store';
import type { MedioCliente } from '../../lib/clientes';
import VisorMedios from './VisorMedios';

export interface ResenaMedia {
  tipo: 'foto' | 'video';
  src: string;
  poster?: string;
  alt: string;
}

export interface Resena {
  id: string;
  nombre: string;
  ciudad: string;
  texto: string;
  estrellas: number;
  media?: ResenaMedia;
}

interface Props {
  resenas: Resena[];
  visiblesInicio?: number;
}

function iniciales(nombre: string): string {
  const partes = nombre.split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
}

export default function ResenasLista({ resenas, visiblesInicio = 6 }: Props) {
  const [expandido, setExpandido] = useState(false);
  const [visor, setVisor] = useState<number | null>(null);
  const visibles = expandido ? resenas : resenas.slice(0, visiblesInicio);

  // Reseñas que traen foto o video, en el mismo orden que la lista
  const medios: MedioCliente[] = resenas
    .filter((r) => r.media)
    .map((r) => ({
      id: r.id,
      tipo: r.media!.tipo,
      src: r.media!.src,
      poster: r.media!.poster,
      alt: r.media!.alt,
      nombre: r.nombre,
      ciudad: r.ciudad,
      estrellas: r.estrellas,
      texto: r.texto,
    }));

  const abrirMedio = (id: string) => {
    const posicion = medios.findIndex((m) => m.id === id);
    if (posicion >= 0) setVisor(posicion);
  };

  return (
    <div class="space-y-5">
      <ul class="grid gap-3 md:grid-cols-2 list-none m-0 p-0">
        {visibles.map((r) => (
          <li key={r.id} class="flex flex-col rounded-[12px] border border-gray-700 bg-[var(--color-hierro)] p-4">
            <div class="flex items-center gap-3">
              <span
                class="w-10 h-10 shrink-0 rounded-full bg-[var(--color-acero)] border border-gray-600 flex items-center justify-center text-sm font-bold text-[var(--color-chispa)]"
                aria-hidden="true"
              >
                {iniciales(r.nombre)}
              </span>
              <div class="min-w-0">
                <p class="m-0 text-base font-bold text-white leading-tight truncate">{r.nombre}</p>
                <p class="m-0 text-xs text-gray-400 truncate">{r.ciudad}</p>
              </div>
            </div>
            <div
              class="mt-3 flex items-center text-[var(--color-chispa)]"
              role="img"
              aria-label={`${r.estrellas} estrellas de 5`}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <svg
                  key={n}
                  class={`w-4 h-4 fill-current ${n > r.estrellas ? 'text-gray-600' : ''}`}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <p class="mt-2 mb-0 text-[15px] leading-relaxed text-gray-100">{r.texto}</p>

            {r.media && (
              <div class="mt-auto pt-3">
                <button
                  type="button"
                  onClick={() => abrirMedio(r.id)}
                  class="flex w-full items-center gap-3 rounded-[10px] border border-gray-600 bg-[var(--color-acero)] p-2 text-left cursor-pointer transition-colors hover:border-[var(--color-naranja)] focus-visible:outline-2 focus-visible:outline-[var(--color-naranja)] focus-visible:outline-offset-2"
                  aria-label={
                    r.media.tipo === 'video'
                      ? `Ver el video que envió ${r.nombre}`
                      : `Ver la foto que envió ${r.nombre}`
                  }
                >
                  <span class="relative block h-14 w-14 shrink-0 overflow-hidden rounded-[6px] bg-[var(--color-hierro)]">
                    <img
                      src={r.media.tipo === 'video' ? r.media.poster : r.media.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      class="h-full w-full object-cover"
                    />
                    {r.media.tipo === 'video' && (
                      <span class="absolute inset-0 flex items-center justify-center bg-black/35" aria-hidden="true">
                        <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    )}
                  </span>
                  <span class="min-w-0">
                    <span class="block text-[13px] font-bold uppercase tracking-wide text-[var(--color-chispa)] font-['Barlow_Condensed']">
                      {r.media.tipo === 'video' ? 'Video del cliente' : 'Foto del cliente'}
                    </span>
                    <span class="block truncate text-[13px] text-gray-300">
                      {r.media.tipo === 'video' ? 'Tócalo para verlo con sonido' : 'Tócala para verla en grande'}
                    </span>
                  </span>
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {resenas.length > visiblesInicio && (
        <button
          type="button"
          aria-expanded={expandido}
          onClick={() => setExpandido(!expandido)}
          class="w-full h-12 rounded-[10px] border border-gray-600 hover:border-gray-400 text-white font-bold text-lg uppercase font-['Barlow_Condensed'] tracking-wider transition-colors cursor-pointer"
        >
          {expandido ? 'Ver menos reseñas' : `Ver las ${resenas.length} reseñas`}
        </button>
      )}

      <button
        type="button"
        onClick={() => ctaClick('resenas', 'pack-1')}
        class="w-full h-14 bg-[var(--color-naranja)] hover:bg-[var(--color-naranja-hover)] active:translate-y-0.5 text-[var(--color-tinta)] font-bold text-xl rounded-[10px] uppercase font-['Barlow_Condensed'] tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Quiero el mío — pagas al recibir</span>
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>

      {visor !== null && (
        <VisorMedios medios={medios} indice={visor} onCerrar={() => setVisor(null)} onNavegar={setVisor} />
      )}
    </div>
  );
}

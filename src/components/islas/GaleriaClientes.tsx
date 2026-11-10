import { useMemo, useState } from 'preact/hooks';
import { resumenResena, type MedioCliente, type TipoMedio } from '../../lib/clientes';
import { ctaClick } from '../../lib/store';
import VisorMedios from './VisorMedios';

type Filtro = 'todo' | TipoMedio;

interface Props {
  medios: MedioCliente[];
}

const FILTROS: { id: Filtro; etiqueta: string }[] = [
  { id: 'todo', etiqueta: 'Todas' },
  { id: 'foto', etiqueta: 'Fotos' },
  { id: 'video', etiqueta: 'Videos' },
];

export default function GaleriaClientes({ medios }: Props) {
  const [filtro, setFiltro] = useState<Filtro>('todo');
  const [abierto, setAbierto] = useState<number | null>(null);

  const visibles = useMemo(
    () => (filtro === 'todo' ? medios : medios.filter((m) => m.tipo === filtro)),
    [filtro, medios]
  );

  const contar = (id: Filtro) => (id === 'todo' ? medios.length : medios.filter((m) => m.tipo === id).length);

  const cambiarFiltro = (nuevo: Filtro) => {
    setAbierto(null);
    setFiltro(nuevo);
  };

  return (
    <>
      <div class="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar fotos y videos de clientes">
        {FILTROS.map((f) => {
          const activo = filtro === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={activo}
              onClick={() => cambiarFiltro(f.id)}
              class={`h-10 px-3.5 rounded-[8px] border text-sm font-bold uppercase tracking-wide font-['Barlow_Condensed'] transition-colors cursor-pointer ${
                activo
                  ? 'bg-[var(--color-naranja)] border-[var(--color-naranja)] text-[var(--color-tinta)]'
                  : 'bg-transparent border-gray-600 text-gray-200 hover:border-gray-400'
              }`}
            >
              {f.etiqueta}
              <span class={`ml-2 font-mono text-[11px] ${activo ? 'text-[var(--color-tinta)]/70' : 'text-gray-400'}`}>
                {contar(f.id)}
              </span>
            </button>
          );
        })}
      </div>

      <p class="mt-2 mb-0 text-xs text-gray-400 md:hidden">
        Desliza para ver todas las fotos y videos
      </p>

      <ul
        class="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 list-none no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0"
        aria-label="Fotos y videos enviados por clientes"
      >
        {visibles.map((medio, posicion) => (
          <li key={medio.id} class="w-[74%] shrink-0 snap-center sm:w-[46%] md:w-auto">
            <button
              type="button"
              onClick={() => setAbierto(posicion)}
              class="group relative block w-full aspect-[4/5] overflow-hidden rounded-[12px] border border-gray-700 bg-[var(--color-hierro)] cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-naranja)] focus-visible:outline-offset-2"
              aria-label={
                medio.tipo === 'video'
                  ? `Ver video de ${medio.nombre}, ${medio.ciudad}`
                  : `Ver foto de ${medio.nombre}, ${medio.ciudad}`
              }
            >
              <img
                src={medio.tipo === 'video' ? medio.poster : medio.src}
                alt={medio.alt}
                loading="lazy"
                decoding="async"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span
                class="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none"
                style="background:linear-gradient(to top, rgba(7,9,11,.85) 0%, transparent 100%)"
                aria-hidden="true"
              ></span>

              {medio.tipo === 'video' && (
                <span class="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <span class="w-14 h-14 rounded-full border border-white/70 bg-black/45 backdrop-blur-[2px] flex items-center justify-center">
                    <svg class="w-6 h-6 text-white translate-x-[1px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              )}

              <span
                class={`absolute left-2 top-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-[0.12em] font-mono ${
                  medio.tipo === 'video'
                    ? 'bg-[var(--color-naranja)] text-[var(--color-tinta)]'
                    : 'bg-black/65 text-white'
                }`}
              >
                {medio.tipo === 'video' ? 'Video' : 'Foto'}
              </span>

              <span class="absolute inset-x-0 bottom-0 px-2.5 pb-2 text-left text-[12px] font-bold text-white">
                {medio.nombre}
                <span class="block text-[11px] font-normal text-gray-300">{medio.ciudad}</span>
              </span>
            </button>

            <div class="mt-2 flex items-center justify-between gap-2">
              <p class="m-0 text-[13px] leading-snug text-gray-200">{resumenResena(medio.texto, 92)}</p>
            </div>
          </li>
        ))}
      </ul>

      <p class="sr-only" aria-live="polite">
        {visibles.length} {visibles.length === 1 ? 'resultado' : 'resultados'} en la galería de clientes
      </p>

      <button
        type="button"
        onClick={() => ctaClick('galeria-clientes', 'pack-1')}
        class="mt-5 w-full h-14 bg-[var(--color-naranja)] hover:bg-[var(--color-naranja-hover)] active:translate-y-0.5 text-[var(--color-tinta)] font-bold text-xl rounded-[10px] uppercase font-['Barlow_Condensed'] tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Quiero el mío — pagas al recibir</span>
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>

      {abierto !== null && (
        <VisorMedios
          medios={visibles}
          indice={abierto}
          onCerrar={() => setAbierto(null)}
          onNavegar={setAbierto}
        />
      )}
    </>
  );
}

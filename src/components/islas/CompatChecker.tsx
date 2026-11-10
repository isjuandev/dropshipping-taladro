import { useState } from 'preact/hooks';
import { configTienda, generarEnlaceWhatsApp } from '../../config/tienda';
import { ctaClick } from '../../lib/store';

export default function CompatChecker() {
  const [mandrilCompatible, setMandrilCompatible] = useState<string | null>(null);
  const [grosorCompatible, setGrosorCompatible] = useState<string | null>(null);

  const { taladro: taladroTexto, grosor: grosorTexto } = configTienda.producto.compatChecker;

  const respondidoTodo = mandrilCompatible !== null && grosorCompatible !== null;
  const esCompatible = mandrilCompatible === 'si' && grosorCompatible === 'si';

  const enlaceDudas = generarEnlaceWhatsApp({
    mensajePersonalizado: `Hola ${configTienda.nombreTienda}, tengo una consulta de compatibilidad sobre la Cortadora de Lámina antes de pedir:`,
  });

  return (
    <div class="mt-10 p-6 md:p-8 rounded-[12px] bg-[var(--color-hierro)] border border-gray-700/80 shadow-lg">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-lg bg-[var(--color-naranja)]/15 text-[var(--color-naranja)] flex items-center justify-center font-bold">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <div>
          <h3 class="text-xl md:text-2xl font-bold text-white font-['Barlow_Condensed'] uppercase tracking-wide">
            Verificador de compatibilidad rápida
          </h3>
          <p class="text-xs text-gray-400">
            Responde 2 preguntas para verificar si Cortadora de Lámina es adecuado para tu trabajo.
          </p>
        </div>
      </div>

      <div class="space-y-6 pt-2">
        {/* Pregunta 1 */}
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-200">
            1. ¿Tu taladro es {taladroTexto}?
          </label>
          <div class="grid grid-cols-3 gap-2">
            {[
              { id: 'si', label: 'Sí, lo es' },
              { id: 'no', label: 'No, es otro' },
              { id: 'duda', label: 'No estoy seguro' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMandrilCompatible(opt.id)}
                class={`py-2 px-3 rounded-lg text-xs md:text-sm font-medium border transition-colors cursor-pointer ${
                  mandrilCompatible === opt.id
                    ? 'bg-[var(--color-naranja)] text-[var(--color-tinta)] border-[var(--color-naranja)] font-bold'
                    : 'bg-[var(--color-acero)] text-gray-300 border-gray-700 hover:border-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pregunta 2 */}
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-200">
            2. ¿La lámina que vas a cortar es plana y mide {grosorTexto}?
          </label>
          <div class="grid grid-cols-3 gap-2">
            {[
              { id: 'si', label: 'Sí, es delgada' },
              { id: 'no', label: 'No, es más gruesa' },
              { id: 'duda', label: 'No estoy seguro' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setGrosorCompatible(opt.id)}
                class={`py-2 px-3 rounded-lg text-xs md:text-sm font-medium border transition-colors cursor-pointer ${
                  grosorCompatible === opt.id
                    ? 'bg-[var(--color-naranja)] text-[var(--color-tinta)] border-[var(--color-naranja)] font-bold'
                    : 'bg-[var(--color-acero)] text-gray-300 border-gray-700 hover:border-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultado */}
        {respondidoTodo && (
          <div class="mt-6 pt-4 border-t border-gray-700/80 transition-all">
            {esCompatible ? (
              <div class="p-4 rounded-xl bg-emerald-950/40 border border-[var(--color-exito)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-[var(--color-exito)] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-base font-bold text-white font-['Barlow_Condensed'] uppercase tracking-wide">
                      ¡Te sirve perfectamente!
                    </h4>
                    <p class="text-xs text-emerald-200/90 mt-0.5">
                      Tu taladro y tu lámina son compatibles. Puedes pedir con total confianza contraentrega.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => ctaClick('compat', 'pack-1')}
                  class="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[var(--color-naranja)] text-[var(--color-tinta)] font-bold text-sm uppercase font-['Barlow_Condensed'] tracking-wide shrink-0 hover:bg-[var(--color-naranja-hover)] cursor-pointer"
                >
                  Ir al pedido
                </button>
              </div>
            ) : (
              <div class="p-4 rounded-xl bg-amber-950/30 border border-amber-600/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-base font-bold text-amber-200 font-['Barlow_Condensed'] uppercase tracking-wide">
                      Escríbenos antes de pedir
                    </h4>
                    <p class="text-xs text-amber-300/80 mt-0.5">
                      Queremos evitarte devoluciones innecesarias. Cuéntanos qué taladro o qué lámina tienes y te asesoramos de inmediato.
                    </p>
                  </div>
                </div>
                <a
                  href={enlaceDudas}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase font-['Barlow_Condensed'] tracking-wide shrink-0 flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z" />
                  </svg>
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

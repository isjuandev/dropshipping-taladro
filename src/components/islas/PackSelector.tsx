import { configTienda, formatCOP } from '../../config/tienda';
import { selectedPackId, currentPack, ctaClick } from '../../lib/store';

export default function PackSelector() {
  const packs = configTienda.packs;
  const packActivo = currentPack.value;

  return (
    <div class="w-full max-w-3xl mx-auto space-y-6">
      <div class="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pt-4 pb-2 md:mx-0 md:px-0" role="radiogroup" aria-label="Opciones de compra en paquete">
        {packs.map((pack) => {
          const isSelected = selectedPackId.value === pack.id;
          return (
            <div
              key={pack.id}
              onClick={() => {
                selectedPackId.value = pack.id;
              }}
              class={`relative rounded-[12px] p-4 cursor-pointer transition-all border snap-center shrink-0 w-[78%] sm:w-[60%] md:w-auto ${
                isSelected
                  ? 'bg-[var(--color-hierro)] border-[var(--color-naranja)] ring-2 ring-[var(--color-naranja)] shadow-xl'
                  : 'bg-[var(--color-hierro)]/60 border-gray-700 hover:border-gray-500'
              }`}
            >
              {pack.etiqueta && (
                <div class="absolute -top-3.5 left-6">
                  <span
                    class={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-md ${
                      pack.destacado
                        ? 'bg-[var(--color-chispa)] text-[var(--color-tinta)]'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {pack.etiqueta}
                  </span>
                </div>
              )}

              <div class="flex items-center justify-between pt-2">
                <div>
                  <h3 class="text-2xl font-bold text-white font-['Barlow_Condensed'] uppercase tracking-wide">
                    {pack.nombre}
                  </h3>
                  <p class="text-xs text-gray-400 mt-0.5">
                    {pack.unidades === 1
                      ? 'Ideal para arreglos ocasionales en casa'
                      : 'La mejor opción: uno para casa y uno para tu taller o trabajo'}
                  </p>
                </div>

                <div
                  class={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-[var(--color-naranja)] bg-[var(--color-naranja)] text-[var(--color-tinta)]'
                      : 'border-gray-500'
                  }`}
                >
                  {isSelected && (
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>

              <div class="mt-3 pt-3 border-t border-gray-700/60 flex items-baseline justify-between">
                <div>
                  <div class="text-xs text-[var(--color-gris)] line-through font-['JetBrains_Mono'] nums-tabular">
                    Antes {formatCOP(pack.precioAnterior)}
                  </div>
                  <div class="text-2xl font-extrabold text-white font-['JetBrains_Mono'] nums-tabular">
                    {formatCOP(pack.precio)}
                  </div>
                </div>

                <div class="text-right">
                  <span class="inline-block px-2.5 py-1 rounded bg-[var(--color-exito)]/15 text-[var(--color-exito)] text-xs font-bold">
                    Ahorras {formatCOP(pack.ahorro)}
                  </span>
                  {pack.unidades > 1 && (
                    <div class="text-[11px] text-gray-400 mt-1 font-['JetBrains_Mono']">
                      {formatCOP(pack.precioUnitario)} c/u
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div class="pt-2 text-center">
        <button
          type="button"
          onClick={() => ctaClick('packs')}
          class="w-full max-w-md mx-auto h-14 bg-[var(--color-naranja)] hover:bg-[var(--color-naranja-hover)] active:translate-y-0.5 text-[var(--color-tinta)] font-bold text-xl rounded-[10px] uppercase font-['Barlow_Condensed'] tracking-wider shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>
            {packActivo.unidades === 2
              ? `Pedir 2 por ${formatCOP(packActivo.precio)}`
              : `Pedir 1 por ${formatCOP(packActivo.precio)}`}
          </span>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
        <p class="mt-2 text-xs text-gray-400">
          Pagas en efectivo al recibir · Sin tarjetas ni cobros por anticipado
        </p>
      </div>
    </div>
  );
}

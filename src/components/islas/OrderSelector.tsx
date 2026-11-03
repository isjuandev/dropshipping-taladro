import { configTienda, formatCOP, porcentajeDescuento } from '../../config/tienda';
import { selectedPackId, currentPack, ctaClick } from '../../lib/store';

export default function OrderSelector() {
  const packs = configTienda.packs;
  const packActivo = currentPack.value;

  return (
    <div class="w-full mt-4 space-y-3">
      <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1" aria-live="polite">
        <span class="text-4xl font-extrabold text-white font-mono nums-tabular">
          {formatCOP(packActivo.precio)}
        </span>
        <span class="text-base text-[var(--color-gris)] line-through font-mono nums-tabular">
          {formatCOP(packActivo.precioAnterior)}
        </span>
        <span class="px-2 py-0.5 rounded bg-[var(--color-exito)]/20 text-[var(--color-exito)] text-xs font-bold uppercase">
          -{porcentajeDescuento(packActivo.precio, packActivo.precioAnterior)}% · Ahorras {formatCOP(packActivo.ahorro)}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Selecciona tu opción">
        {packs.map((pack) => {
          const isSelected = selectedPackId.value === pack.id;
          return (
            <button
              key={pack.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                selectedPackId.value = pack.id;
              }}
              class={`relative p-3 rounded-[12px] text-left transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[var(--color-hierro)] border-[var(--color-naranja)] ring-1 ring-[var(--color-naranja)] shadow-lg'
                  : 'bg-[var(--color-acero)] border-gray-700 hover:border-gray-500'
              }`}
            >
              {pack.destacado && (
                <span class="absolute -top-2.5 right-3 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[var(--color-chispa)] text-[var(--color-tinta)]">
                  Más vendido
                </span>
              )}
              <div class="flex items-center justify-between">
                <span class="font-bold text-white text-base font-['Barlow_Condensed'] uppercase tracking-wide">
                  {pack.unidades} {pack.unidades === 1 ? 'unidad' : 'unidades'}
                </span>
                <span
                  class={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-[var(--color-naranja)] bg-[var(--color-naranja)] text-[var(--color-tinta)]'
                      : 'border-gray-600'
                  }`}
                >
                  {isSelected && (
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
              </div>
              <div class="mt-1 text-xl font-bold text-white font-mono nums-tabular">
                {formatCOP(pack.precio)}
              </div>
              {pack.unidades > 1 && (
                <div class="text-xs text-gray-300 font-mono nums-tabular">
                  {formatCOP(pack.precioUnitario)} c/u
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div>
        <button
          type="button"
          onClick={() => ctaClick('hero')}
          class="w-full h-14 bg-[var(--color-naranja)] hover:bg-[var(--color-naranja-hover)] active:translate-y-0.5 text-[var(--color-tinta)] font-bold text-xl rounded-[10px] uppercase font-['Barlow_Condensed'] tracking-wider shadow-md hover:shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Pedir ahora — pagas al recibir</span>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
        <p class="mt-2 text-center text-[13px] text-gray-300">Envío gratis · Taladro no incluido · Lámina hasta 1 mm</p>
      </div>
    </div>
  );
}

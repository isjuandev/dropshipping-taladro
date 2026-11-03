import { signal, computed } from '@preact/signals';
import { configTienda, type PackItem } from '../config/tienda';
import { pushDataLayer } from './tracking';

// Pack seleccionado globalmente compartido entre islas de Preact
// Default: Pack 2 (más vendido / mejor valor)
export const selectedPackId = signal<string>('pack-2');

// Objeto completo del pack activo
export const currentPack = computed<PackItem>(() => {
  const pack = configTienda.packs.find((p) => p.id === selectedPackId.value);
  return pack || configTienda.packs[0];
});

// Función centralizada para saltar al formulario, actualizar el pack y enfocar el primer campo vacío
export function scrollToPedidoAndFocus(packId?: string): void {
  if (packId) {
    selectedPackId.value = packId;
  }

  if (typeof window === 'undefined') return;

  const target = document.getElementById('pedido');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Tras iniciar el desplazamiento, enfocar el primer campo editable vacío
    setTimeout(() => {
      const form = target.querySelector('form');
      if (form) {
        const inputs = Array.from(
          form.querySelectorAll<HTMLInputElement>('input:not([type="hidden"]):not([type="checkbox"])')
        ).filter((inp) => !inp.closest('[aria-hidden="true"]')); // omite el honeypot oculto
        const firstEmpty = inputs.find((inp) => !inp.value.trim());
        if (firstEmpty) {
          firstEmpty.focus();
        } else if (inputs[0]) {
          inputs[0].focus();
        }
      }
    }, 450);
  }
}

// Clic en cualquier CTA: registra el bloque de origen y salta al formulario con el pack elegido
export function ctaClick(origen: string, packId?: string): void {
  pushDataLayer({ event: 'cta_click', origen });
  scrollToPedidoAndFocus(packId);
}

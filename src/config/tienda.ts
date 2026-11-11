export interface EspecificacionItem {
  etiqueta: string;
  clave: string;
  valor: string;
  porConfirmar: boolean;
  descripcion?: string;
}

export interface PackItem {
  id: string;
  nombre: string;
  unidades: number;
  precio: number;
  precioAnterior: number;
  ahorro: number;
  precioUnitario: number;
  etiqueta?: string;
  destacado?: boolean;
}

export const configTienda = {
  nombreTienda: 'ViralyShop',
  whatsappSoporte: '573334021246',
  moneda: 'COP',
  tiempoDespacho: '1 a 2 días hábiles',
  tiempoEntrega: '3 a 5 días hábiles según la ciudad',
  garantia: 'Garantía de 30 días por defectos de fábrica',
  razonSocial: 'ViralyShop S.A.S.',
  nit: '901.842.319-1',
  horarioAtencion: 'Lunes a Domingo · 24/7',
  redes: {
    instagram: 'https://instagram.com/ViralyShop'
  },
  metodosPago: [
    'Pago Contra Entrega en efectivo al recibir',
    'Transferencia Bancolombia / Nequi / Daviplata al recibir',
  ],
  gtmId: import.meta.env.PUBLIC_GTM_ID || '',
  pixelId: import.meta.env.PUBLIC_PIXEL_ID || '1101201176110449',
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '',

  pedido: {
    modo: 'directo' as const,
    endpoint:
      import.meta.env.PUBLIC_NEXOBITE_API_URL ||
      'https://api.nexobite.com/api/v1/public/dropshipping/viralyshop/leads',
    productId: import.meta.env.PUBLIC_NEXOBITE_PRODUCT_ID || '2307840',
    campaignSlug: import.meta.env.PUBLIC_NEXOBITE_CAMPAIGN_SLUG || 'viralyshop',
    horarioConfirmacion: 'lunes a sábado, 8 a. m. a 6 p. m.',
    tiempoConfirmacion: 'en menos de 2 horas hábiles',
  },

  temporadaRegalo: {
    activo: true,
    titulo: 'El regalo para el que arregla todo en la casa',
    subtitulo: 'Aprovecha la temporada: lleva el pack de 2 con descuento especial para ti y para obsequiar.',
  },

  producto: {
    nombre: 'Cortadora de Lámina',
    nombreCompleto: 'Cortadora de Lámina — Accesorio para taladro',
    sku: 'HEXACUT-PRO',
    variante: 'Cortador de lámina para taladro · Acople hexagonal',
    precio: 99900,
    precioAnterior: 139000,
    ahorro: 39100,
    calificacion: 4.9,
    totalResenas: 148,
    incluyeRepuesto: false, // Si es true, añade "Ruedas de repuesto" a extras del payload

    // Especificaciones técnicas controladas desde configuración
    // Marcadas "POR CONFIRMAR" hasta que el dueño las valide con su lote físico
    especificaciones: {
      grosorMaximo: 'Lámina plana de menos de 1 mm; hasta 1,5 mm en aluminio y cobre',
      materiales: 'Hierro 0,3–1 mm · Lámina blanca 0,3–1,2 mm · Acero 0,8–1 mm · Cobre 0,3–1,5 mm · Aluminio 0,3–1,5 mm',
      noApto: 'Plástico, aleaciones de alta dureza y materiales angulares o de forma especial',
      compatibilidad: 'Taladros de litio de 12 a 21 V',
      medidas: '125 × 59 × 30 mm',
      peso: '388 g',
    },

    // Textos del comprobador de compatibilidad (CompatChecker)
    compatChecker: {
      taladro: 'de litio de 12 a 21 V',
      grosor: 'menos de 1 mm (hasta 1,5 mm si es aluminio o cobre)',
    },
  },

  packs: [
    {
      id: 'pack-1',
      nombre: '1 Unidad',
      unidades: 1,
      precio: 99900,
      precioAnterior: 139000,
      ahorro: 39100,
      precioUnitario: 99900,
      etiqueta: 'Precio de lanzamiento',
      destacado: false,
    },
    {
      id: 'pack-2',
      nombre: 'Pack 2 unidades',
      unidades: 2,
      precio: 169900,
      precioAnterior: 278000,
      ahorro: 108100,
      precioUnitario: 84950,
      etiqueta: 'PARA TI Y TU TALLER · MÁS VENDIDO',
      destacado: true,
    },
  ] as PackItem[],
};

// Formateador estándar de moneda colombiana
export function formatCOP(monto: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(monto);
}

// Porcentaje de descuento entero respecto al precio anterior
export function porcentajeDescuento(precio: number, precioAnterior: number): number {
  return Math.round((1 - precio / precioAnterior) * 100);
}

// Verifica si existe alguna especificación pendiente de confirmar
export function hayEspecificacionesPorConfirmar(): boolean {
  return Object.values(configTienda.producto.especificaciones).some(
    (val) => val === 'POR CONFIRMAR'
  );
}

// Genera el enlace directo a WhatsApp para atención/soporte en casos de error o duda
export function generarEnlaceWhatsApp(opciones?: {
  pedidoId?: string;
  producto?: string;
  pack?: string;
  total?: number;
  mensajePersonalizado?: string;
}): string {
  const telefono = configTienda.whatsappSoporte.replace(/\D/g, '');
  let texto = '';

  if (opciones?.mensajePersonalizado) {
    texto = opciones.mensajePersonalizado;
  } else {
    texto = `Hola ${configTienda.nombreTienda}, requiero asistencia con mi pedido de Cortadora de Lámina.`;
    if (opciones?.pedidoId) {
      texto += `\n- Número de pedido: ${opciones.pedidoId}`;
    }
    if (opciones?.pack) {
      texto += `\n- Opción seleccionada: ${opciones.pack}`;
    }
    if (opciones?.total) {
      texto += `\n- Total: ${formatCOP(opciones.total)}`;
    }
  }

  return `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
}

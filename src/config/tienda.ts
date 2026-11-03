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

// Reseña visual de un cliente real. Solo fotos o videos reales: nunca rostros generados por IA.
export interface UgcItem {
  id: string;
  tipo: 'foto' | 'video';
  src: string; // ruta en /public (foto o mp4)
  poster?: string; // obligatorio para video
  alt: string;
  nombre: string;
  ciudad: string;
  estrellas: number;
}

export const configTienda = {
  nombreTienda: 'ViralyShop',
  whatsappSoporte: '573001234567',
  moneda: 'COP',
  tiempoDespacho: '1 a 2 días hábiles',
  tiempoEntrega: '3 a 5 días hábiles según la ciudad',
  garantia: 'Garantía de 30 días por defectos de fábrica',
  razonSocial: 'ViralyShop S.A.S.',
  nit: '901.842.319-1',
  gtmId: '',
  pixelId: '',

  temporadaRegalo: {
    activo: true,
    titulo: 'El regalo para el que arregla todo en la casa',
    subtitulo: 'Aprovecha la temporada: lleva el pack de 2 con descuento especial para ti y para obsequiar.',
  },

  // Galería de clientes: si está vacía, la sección no se muestra.
  ugc: [] as UgcItem[],

  producto: {
    nombre: 'Cortadora de Lámina',
    nombreCompleto: 'Cortadora de Lámina — Accesorio para taladro',
    sku: 'HEXACUT-PRO',
    variante: 'Cortador de lámina para taladro · Acople hexagonal',
    precio: 99900,
    precioAnterior: 200000,
    ahorro: 100100,
    calificacion: 4.9,
    totalResenas: 148,
    incluyeRepuesto: false, // Si es true, añade "Ruedas de repuesto" a extras del payload

    // Especificaciones técnicas controladas desde configuración
    // Marcadas "POR CONFIRMAR" hasta que el dueño las valide con su lote físico
    especificaciones: {
      grosorMaximo: 'POR CONFIRMAR', // Ej: 1,2 mm en lámina de zinc o aluminio; menos en acero
      materiales: 'POR CONFIRMAR', // Ej: Lámina de zinc, galvanizada, aluminio y hojalata
      acople: 'POR CONFIRMAR', // Ej: Vástago hexagonal de 6,35 mm (1/4")
      velocidadRecomendada: 'POR CONFIRMAR', // Ej: 1.500 a 3.000 RPM
      compatibilidad: 'POR CONFIRMAR', // Ej: Taladros con mandril de 10 a 13 mm
      peso: 'POR CONFIRMAR', // Ej: Aprox. 450 g
    },

    // Valores de referencia para el comprobador de compatibilidad (CompatChecker)
    compatCheckerDefaults: {
      mandrilMinMm: 10,
      mandrilMaxMm: 13,
      grosorMaxMm: 1.2,
    },
  },

  packs: [
    {
      id: 'pack-1',
      nombre: '1 Unidad',
      unidades: 1,
      precio: 99900,
      precioAnterior: 200000,
      ahorro: 100100,
      precioUnitario: 99900,
      etiqueta: 'Precio de lanzamiento',
      destacado: false,
    },
    {
      id: 'pack-2',
      nombre: 'Pack 2 unidades',
      unidades: 2,
      precio: 169900,
      precioAnterior: 400000,
      ahorro: 230100,
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

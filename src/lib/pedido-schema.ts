import { z } from 'zod';

// Esquema de validación para los datos capturados en el formulario
export const clienteFormSchema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(1, 'Escribe tu nombre y apellido')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Ingresa al menos nombre y apellido (mínimo dos palabras)',
    }),
  celular: z
    .string()
    .trim()
    .min(1, 'Escribe tu número de celular')
    .refine((val) => {
      const limpio = val.replace(/\D/g, '');
      return limpio.length === 10 && limpio.startsWith('3');
    }, {
      message: 'Ingresa un celular válido de 10 dígitos que empiece por 3 (ej: 300 123 4567)',
    }),
  departamento: z
    .string()
    .trim()
    .min(1, 'Selecciona tu departamento'),
  ciudad: z
    .string()
    .trim()
    .min(1, 'Selecciona tu ciudad o municipio'),
  direccion: z
    .string()
    .trim()
    .min(8, 'La dirección debe tener al menos 8 caracteres')
    .refine((val) => /\d/.test(val), {
      message: 'La dirección debe incluir al menos un número (ej: Calle 45 # 12-30)',
    }),
  indicaciones: z
    .string()
    .max(300, 'Las indicaciones no pueden superar los 300 caracteres')
    .optional()
    .default(''),
  consentimiento: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debes autorizar el tratamiento de datos para procesar tu entrega',
    }),
});

export type ClienteFormData = z.infer<typeof clienteFormSchema>;

// Esquema completo del payload para la API pública de NexoBite Leads
export const nexobitePayloadSchema = z.object({
  pedidoId: z.string().regex(/^PED-\d{8}-[A-Z0-9]{4}$/, 'Formato de pedidoId inválido (debe ser PED-AAAAMMDD-XXXX)'),
  fecha: z.string().datetime({ message: 'La fecha debe estar en formato ISO 8601 UTC' }),
  tienda: z.string().min(1, 'El nombre de la tienda es obligatorio'),
  landing: z.string().url('La URL de la landing debe ser válida'),
  campaignSlug: z.string().min(1, 'El campaignSlug es obligatorio'),
  producto: z.object({
    providerProductId: z.string().min(1, 'providerProductId obligatorio'),
    nombre: z.string().min(1, 'nombre de producto obligatorio'),
    sku: z.string().min(1, 'sku obligatorio'),
    variante: z.string().min(1, 'variante obligatoria'),
    paquete: z.string().min(1, 'paquete obligatorio'),
    cantidad: z.number().int().positive(),
    extras: z.array(z.string()),
    precioUnitario: z.number().positive(),
    total: z.number().positive(),
  }),
  cliente: z.object({
    nombreCompleto: z.string().min(2),
    celular: z.string().regex(/^\+573\d{9}$/, 'El celular debe tener formato internacional +573XXXXXXXXX'),
    departamento: z.string().min(1),
    ciudad: z.string().min(1),
    direccion: z.string().min(8),
    indicaciones: z.string(),
  }),
  consentimiento: z.literal(true),
  origen: z.object({
    utm_source: z.string(),
    utm_medium: z.string(),
    utm_campaign: z.string(),
    utm_content: z.string(),
    fbclid: z.string(),
    referrer: z.string(),
    fbp: z.string(),
    fbc: z.string(),
  }),
  antispam: z.object({
    empresa: z.string().max(0, 'Honeypot activado'),
    segundos: z.number().min(5, 'Formulario completado demasiado rápido'),
  }),
});

export type NexobitePayload = z.infer<typeof nexobitePayloadSchema>;

// Genera el ID de pedido con la fecha en la zona horaria de Bogotá (UTC-5): PED-AAAAMMDD-XXXX
export function generarPedidoIdBogota(): string {
  const ahora = new Date();
  // Formato para Bogotá (UTC-5)
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(ahora);

  const year = partes.find((p) => p.type === 'year')?.value || '2026';
  const month = partes.find((p) => p.type === 'month')?.value || '11';
  const day = partes.find((p) => p.type === 'day')?.value || '02';

  // 4 caracteres alfanuméricos en mayúsculas
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let sufijo = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * caracteres.length);
    sufijo += caracteres[idx];
  }

  return `PED-${year}${month}${day}-${sufijo}`;
}

// Formatea el celular para visualización agradable en vivo: 300 000 0000
export function formatearCelularColombiano(valor: string): string {
  const soloDigitos = valor.replace(/\D/g, '').slice(0, 10);
  if (soloDigitos.length <= 3) return soloDigitos;
  if (soloDigitos.length <= 6) return `${soloDigitos.slice(0, 3)} ${soloDigitos.slice(3)}`;
  return `${soloDigitos.slice(0, 3)} ${soloDigitos.slice(3, 6)} ${soloDigitos.slice(6)}`;
}

// Transforma el celular al formato internacional exigido por NexoBite: +573XXXXXXXXX
export function limpiarCelularParaPayload(valor: string): string {
  const soloDigitos = valor.replace(/\D/g, '');
  if (soloDigitos.startsWith('57') && soloDigitos.length === 12) {
    return `+${soloDigitos}`;
  }
  return `+57${soloDigitos}`;
}

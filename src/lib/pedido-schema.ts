import { z } from 'zod';

// Esquema de validación para los datos capturados en el formulario
export const clienteFormSchema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(3, 'Escribe tu nombre y apellido')
    .refine((val) => val.trim().split(/\s+/).filter(Boolean).length >= 2, {
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
  codigoDane: z
    .string()
    .trim()
    .default('00000'),
  tipoEntrega: z
    .enum(['domicilio', 'oficina'])
    .default('domicilio'),
  direccion: z
    .string()
    .trim()
    .min(3, 'La dirección debe tener al menos 3 caracteres'),
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
  pedidoId: z.string().regex(/^PED-\d{8}-[A-Za-z0-9]{4}$/, 'Formato de pedidoId inválido (debe ser PED-AAAAMMDD-XXXX)'),
  fecha: z.string(),
  tienda: z.string().min(1, 'El nombre de la tienda es obligatorio'),
  landing: z.string().url('La URL de la landing debe ser válida'),
  campaignSlug: z.string().min(1, 'El campaignSlug es obligatorio'),
  producto: z.object({
    providerProductId: z.string().min(1, 'providerProductId obligatorio'),
    nombre: z.string().min(1, 'nombre de producto obligatorio'),
    sku: z.string().optional(),
    variante: z.string().min(1, 'variante obligatoria'),
    paquete: z.string().min(1, 'paquete obligatorio'),
    cantidad: z.number().int().positive(),
    extras: z.array(z.string()).default([]),
    precioUnitario: z.number().positive(),
    total: z.number().positive(),
  }),
  cliente: z.object({
    nombreCompleto: z.string().min(2),
    celular: z.string(),
    departamento: z.string().min(1),
    ciudad: z.string().min(1),
    codigoDane: z.string().optional(),
    direccion: z.string().min(3),
    indicaciones: z.string().optional().default(''),
  }),
  consentimiento: z.literal(true),
  origen: z.object({
    utm_source: z.string().optional().default(''),
    utm_medium: z.string().optional().default(''),
    utm_campaign: z.string().optional().default(''),
    utm_content: z.string().optional().default(''),
    fbclid: z.string().optional().default(''),
    referrer: z.string().optional().default(''),
    fbp: z.string().optional(),
    fbc: z.string().optional(),
  }),
  antispam: z.object({
    empresa: z.string().default(''),
    segundos: z.number().default(0),
  }),
  turnstileToken: z.string().optional(),
});

export type NexobitePayload = z.infer<typeof nexobitePayloadSchema>;

/** Respuesta del endpoint público de dropshipping de NexoBite */
export interface NexoBiteLeadResponse {
  data?: {
    orderId?: string;
    status?: string;
    duplicate?: boolean;
    spam?: boolean;
    message?: string;
  };
  message?: string;
}

// Genera el ID de pedido con la fecha en la zona horaria de Bogotá (UTC-5): PED-AAAAMMDD-XXXX
export function generarPedidoIdBogota(fechaBase?: Date): string {
  const now = fechaBase || new Date();
  const bogotaStr = now.toLocaleString('en-US', { timeZone: 'America/Bogota' });
  const bogotaDate = new Date(bogotaStr);

  const yyyy = bogotaDate.getFullYear();
  const mm = String(bogotaDate.getMonth() + 1).padStart(2, '0');
  const dd = String(bogotaDate.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;

  // Conjunto alfanumérico sin caracteres ambiguos (sin 0, O, 1, I, L)
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    randomPart += chars[idx];
  }

  return `PED-${datePart}-${randomPart}`;
}

export const generatePedidoId = generarPedidoIdBogota;

// Formatea el celular para visualización agradable en vivo: 300 000 0000
export function formatearCelularColombiano(valor: string): string {
  const soloDigitos = valor.replace(/\D/g, '').slice(0, 10);
  if (soloDigitos.length <= 3) return soloDigitos;
  if (soloDigitos.length <= 6) return `${soloDigitos.slice(0, 3)} ${soloDigitos.slice(3)}`;
  return `${soloDigitos.slice(0, 3)} ${soloDigitos.slice(3, 6)} ${soloDigitos.slice(6)}`;
}

export const formatCelularInput = formatearCelularColombiano;

export function cleanCelularDigits(formatted: string): string {
  return formatted.replace(/\D/g, '').slice(0, 10);
}

// Transforma el celular al formato internacional exigido por NexoBite: +573XXXXXXXXX
export function limpiarCelularParaPayload(valor: string): string {
  const soloDigitos = cleanCelularDigits(valor);
  return `+57${soloDigitos}`;
}

export const toInternationalPhone = limpiarCelularParaPayload;

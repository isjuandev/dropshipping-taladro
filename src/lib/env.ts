import { z } from 'zod';

const envSchema = z.object({
  PUBLIC_NEXOBITE_API_URL: z
    .string()
    .url('PUBLIC_NEXOBITE_API_URL debe ser una URL válida hacia la API de NexoBite')
    .default('https://api.nexobite.com/api/v1/public/dropshipping/viralyshop/leads'),
  PUBLIC_NEXOBITE_PRODUCT_ID: z
    .string()
    .min(1, 'PUBLIC_NEXOBITE_PRODUCT_ID no puede estar vacío')
    .default('2307840'),
  PUBLIC_NEXOBITE_CAMPAIGN_SLUG: z
    .string()
    .min(1, 'PUBLIC_NEXOBITE_CAMPAIGN_SLUG no puede estar vacío')
    .default('viralyshop'),
  PUBLIC_TURNSTILE_SITE_KEY: z.string().optional().default(''),
  PUBLIC_GTM_ID: z.string().optional().default(''),
  PUBLIC_PIXEL_ID: z.string().optional().default('1101201176110449'),
});

export function validateEnv() {
  const parsed = envSchema.safeParse({
    PUBLIC_NEXOBITE_API_URL: import.meta.env.PUBLIC_NEXOBITE_API_URL || undefined,
    PUBLIC_NEXOBITE_PRODUCT_ID: import.meta.env.PUBLIC_NEXOBITE_PRODUCT_ID || undefined,
    PUBLIC_NEXOBITE_CAMPAIGN_SLUG: import.meta.env.PUBLIC_NEXOBITE_CAMPAIGN_SLUG || undefined,
    PUBLIC_TURNSTILE_SITE_KEY: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || undefined,
    PUBLIC_GTM_ID: import.meta.env.PUBLIC_GTM_ID || undefined,
    PUBLIC_PIXEL_ID: import.meta.env.PUBLIC_PIXEL_ID || undefined,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    const msg = `\n[ERROR BUILD] Variables de entorno faltantes o inválidas:\n${issues}\nVerifica tu archivo .env o la configuración de tu servidor.\n`;
    console.error(msg);
    throw new Error(msg);
  }

  return parsed.data;
}

export const env = validateEnv();

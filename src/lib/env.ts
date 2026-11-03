import { z } from 'zod';

const envSchema = z.object({
  PUBLIC_NEXOBITE_API_URL: z
    .string({
      required_error: 'PUBLIC_NEXOBITE_API_URL es obligatorio en las variables de entorno',
    })
    .url('PUBLIC_NEXOBITE_API_URL debe ser una URL válida hacia la API de NexoBite'),
  PUBLIC_NEXOBITE_PRODUCT_ID: z
    .string({
      required_error: 'PUBLIC_NEXOBITE_PRODUCT_ID es obligatorio',
    })
    .min(1, 'PUBLIC_NEXOBITE_PRODUCT_ID no puede estar vacío'),
  PUBLIC_NEXOBITE_CAMPAIGN_SLUG: z
    .string({
      required_error: 'PUBLIC_NEXOBITE_CAMPAIGN_SLUG es obligatorio',
    })
    .min(1, 'PUBLIC_NEXOBITE_CAMPAIGN_SLUG no puede estar vacío'),
});

export function validateEnv() {
  const parsed = envSchema.safeParse({
    PUBLIC_NEXOBITE_API_URL: import.meta.env.PUBLIC_NEXOBITE_API_URL,
    PUBLIC_NEXOBITE_PRODUCT_ID: import.meta.env.PUBLIC_NEXOBITE_PRODUCT_ID,
    PUBLIC_NEXOBITE_CAMPAIGN_SLUG: import.meta.env.PUBLIC_NEXOBITE_CAMPAIGN_SLUG,
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

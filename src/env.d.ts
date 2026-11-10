/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_NEXOBITE_API_URL?: string;
  readonly PUBLIC_NEXOBITE_PRODUCT_ID?: string;
  readonly PUBLIC_NEXOBITE_CAMPAIGN_SLUG?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly PUBLIC_GTM_ID?: string;
  readonly PUBLIC_PIXEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

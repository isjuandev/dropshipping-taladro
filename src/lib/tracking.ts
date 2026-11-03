import { configTienda } from '../config/tienda';

// Claves de almacenamiento
const STORAGE_ORIGEN_KEY = 'hexacut_origen_tracking';
const STORAGE_INITIATE_CHECKOUT_SENT = 'hexacut_initiate_checkout_sent';

export interface OrigenTracking {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  fbclid: string;
  referrer: string;
  fbp: string;
  fbc: string;
}

const STORAGE_VIDEO_PLAY_PREFIX = 'hexacut_video_play_';

// Empuja un evento al dataLayer (se crea si GTM aún no cargó)
export function pushDataLayer(evento: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const w = window as any;
  (w.dataLayer = w.dataLayer || []).push(evento);
}

// Evento video_play: una vez por video y sesión
export function registrarVideoPlay(videoId: string): void {
  try {
    const key = STORAGE_VIDEO_PLAY_PREFIX + videoId;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch (e) {
    // sin sessionStorage: se registra igual
  }
  pushDataLayer({ event: 'video_play', video_id: videoId });
}

// Lee una cookie por su nombre
function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : '';
}

// Inicializa y captura parámetros UTM y Meta Pixel desde la URL al ingresar
export function inicializarTracking(): OrigenTracking {
  if (typeof window === 'undefined') {
    return {
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_content: '',
      fbclid: '',
      referrer: '',
      fbp: '',
      fbc: '',
    };
  }

  try {
    // Si ya existe en sessionStorage, lo recuperamos
    const guardado = sessionStorage.getItem(STORAGE_ORIGEN_KEY);
    const ahoraMs = Date.now();
    const urlParams = new URLSearchParams(window.location.search);

    const utm_source = urlParams.get('utm_source') || '';
    const utm_medium = urlParams.get('utm_medium') || '';
    const utm_campaign = urlParams.get('utm_campaign') || '';
    const utm_content = urlParams.get('utm_content') || '';
    const fbclid = urlParams.get('fbclid') || '';
    const referrer = document.referrer || '';

    // Cookies de Meta
    const cookieFbp = getCookie('_fbp');
    let cookieFbc = getCookie('_fbc');

    // Si no hay cookie _fbc pero sí vino fbclid en la URL, construir fbc
    if (!cookieFbc && fbclid) {
      cookieFbc = `fb.1.${ahoraMs}.${fbclid}`;
    }

    let tracking: OrigenTracking;

    if (guardado) {
      const previo = JSON.parse(guardado) as OrigenTracking;
      tracking = {
        utm_source: utm_source || previo.utm_source || '',
        utm_medium: utm_medium || previo.utm_medium || '',
        utm_campaign: utm_campaign || previo.utm_campaign || '',
        utm_content: utm_content || previo.utm_content || '',
        fbclid: fbclid || previo.fbclid || '',
        referrer: referrer || previo.referrer || '',
        fbp: cookieFbp || previo.fbp || '',
        fbc: cookieFbc || previo.fbc || '',
      };
    } else {
      tracking = {
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        fbclid,
        referrer,
        fbp: cookieFbp,
        fbc: cookieFbc,
      };
    }

    sessionStorage.setItem(STORAGE_ORIGEN_KEY, JSON.stringify(tracking));
    return tracking;
  } catch (err) {
    console.warn('Error capturando tracking:', err);
    return {
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_content: '',
      fbclid: '',
      referrer: '',
      fbp: '',
      fbc: '',
    };
  }
}

// Dispara evento BeginCheckout / InitiateCheckout al primer foco del formulario
export function dispararInicioCheckout(precioTotal: number): void {
  if (typeof window === 'undefined') return;

  try {
    if (sessionStorage.getItem(STORAGE_INITIATE_CHECKOUT_SENT)) {
      return; // Solo una vez por sesión
    }
    sessionStorage.setItem(STORAGE_INITIATE_CHECKOUT_SENT, '1');

    // Google Tag Manager
    if (configTienda.gtmId && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'COP',
          value: precioTotal,
          items: [
            {
              item_name: configTienda.producto.nombre,
              item_id: configTienda.producto.sku,
              price: precioTotal,
              quantity: 1,
            },
          ],
        },
      });
    }

    // Meta Pixel
    if (configTienda.pixelId && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'InitiateCheckout', {
        value: precioTotal,
        currency: 'COP',
        content_name: configTienda.producto.nombre,
        content_ids: [configTienda.producto.sku],
      });
    }
  } catch (e) {
    // silencioso para no interrumpir la experiencia de usuario
  }
}

// Dispara evento Lead / GenerateLead en página de gracias (una sola vez por pedidoId)
export function dispararEventoLead(pedidoId: string, precioTotal: number, packNombre: string): void {
  if (typeof window === 'undefined') return;

  const keyStorage = `hexacut_lead_sent_${pedidoId}`;
  if (localStorage.getItem(keyStorage)) {
    return; // Ya trackeado
  }

  try {
    // Google Tag Manager
    if (configTienda.gtmId && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'generate_lead',
        ecommerce: {
          transaction_id: pedidoId,
          currency: 'COP',
          value: precioTotal,
          items: [
            {
              item_name: `${configTienda.producto.nombre} - ${packNombre}`,
              item_id: configTienda.producto.sku,
              price: precioTotal,
              quantity: 1,
            },
          ],
        },
      });
    }

    // Meta Pixel (con eventID para deduplicación con CAPI)
    if (configTienda.pixelId && typeof (window as any).fbq === 'function') {
      (window as any).fbq(
        'track',
        'Lead',
        {
          value: precioTotal,
          currency: 'COP',
          content_name: `${configTienda.producto.nombre} - ${packNombre}`,
          content_ids: [configTienda.producto.sku],
        },
        { eventID: pedidoId }
      );
    }

    localStorage.setItem(keyStorage, '1');
  } catch (e) {
    console.warn('Error enviando evento Lead:', e);
  }
}

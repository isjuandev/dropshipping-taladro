import fs from 'node:fs';
import path from 'node:path';

// Cargar variables de entorno desde .env si existe
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

const apiUrl = process.env.PUBLIC_NEXOBITE_API_URL || 'https://api.nexobite.com/api/v1/public/dropshipping/campana-hexacut-pro/leads';
const productId = process.env.PUBLIC_NEXOBITE_PRODUCT_ID || '98745';
const campaignSlug = process.env.PUBLIC_NEXOBITE_CAMPAIGN_SLUG || 'campana-hexacut-pro';

// Generar pedidoId con fecha de Bogotá UTC-5
const ahora = new Date();
const partes = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).formatToParts(ahora);

const year = partes.find((p) => p.type === 'year')?.value || '2026';
const month = partes.find((p) => p.type === 'month')?.value || '11';
const day = partes.find((p) => p.type === 'day')?.value || '02';
const sufijo = Math.random().toString(36).substring(2, 6).toUpperCase();
const pedidoId = `PED-${year}${month}${day}-${sufijo}`;

const testPayload = {
  pedidoId,
  fecha: new Date().toISOString(),
  tienda: 'ViralyShop',
  landing: 'https://viraly.shop/cortador-lamina-taladro',
  campaignSlug,
  producto: {
    providerProductId: String(productId),
    nombre: 'Cortadora de Lámina · Pack 2 unidades',
    sku: 'HEXACUT-PRO',
    variante: 'Cortador de lámina para taladro · Acople hexagonal',
    paquete: 'Pack 2 unidades',
    cantidad: 2,
    extras: [],
    precioUnitario: 84950,
    total: 169900,
  },
  cliente: {
    nombreCompleto: 'Ana Restrepo',
    celular: '+573001234567',
    departamento: 'Antioquia',
    ciudad: 'Medellín',
    direccion: 'Calle 45 #12-30, apto 302',
    indicaciones: 'Entregar después de las 2 p. m.',
  },
  consentimiento: true,
  origen: {
    utm_source: 'test_script',
    utm_medium: 'cli',
    utm_campaign: 'verificacion_api',
    utm_content: 'pnpm_test_pedido',
    fbclid: '',
    referrer: '',
    fbp: 'fb.1.1730000000000.1234567890',
    fbc: '',
  },
  antispam: {
    empresa: '',
    segundos: 24,
  },
};

console.log('================================================================');
console.log('PRUEBA DE ENVÍO DE PEDIDO A NEXOBITE SAAS (DROPSHIPPING)');
console.log('================================================================');
console.log(`Endpoint destino: ${apiUrl}`);
console.log(`Campaign Slug:    ${campaignSlug}`);
console.log(`Product ID:       ${productId}`);
console.log(`Pedido ID:        ${pedidoId}`);
console.log('\nPayload a enviar:\n', JSON.stringify(testPayload, null, 2));

async function runTest() {
  console.log('\nEnviando petición POST...');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    console.log(`\nCódigo de Respuesta HTTP: ${res.status} (${res.statusText})`);
    const data = await res.json().catch(() => null);
    console.log('Cuerpo de la respuesta:', data || '[Sin cuerpo JSON]');

    if (res.status === 200 || res.status === 201) {
      console.log('\n✅ ÉXITO: El lead fue recibido y procesado por la API de NexoBite.');
    } else if (res.status === 404 || res.status === 422) {
      console.log('\n⚠️ NOTA (404/422): El endpoint responde pero la campaña o producto de prueba no existe aún en la base de datos de NexoBite.');
      console.log('Configura un PUBLIC_NEXOBITE_CAMPAIGN_SLUG y PUBLIC_NEXOBITE_PRODUCT_ID reales en tu .env.');
    } else {
      console.log(`\nℹ️ Respuesta del servidor: ${res.status}`);
    }
  } catch (err) {
    clearTimeout(timeout);
    console.error('\n❌ Error durante el envío del pedido:', err.message);
  }
}

runTest();

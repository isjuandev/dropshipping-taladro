# Cortadora de Lámina — Landing Page de Conversión Contraentrega (ViralyShop)

Landing page de producto único desarrollada para e-commerce contraentrega en Colombia con despacho directo a la API pública de **NexoBite SaaS**.

Arquitectura 100 % estática (SSG) de ultra alto rendimiento, construida con **Astro 5**, **Tailwind CSS v4**, islas interactivas en **Preact + Signals** y tipografía de taller colombiano.

---

## Características Principales

- **Checkout Directo a NexoBite SaaS**: Envía órdenes en modo directo desde el navegador mediante `fetch` POST con payload normalizado y validado con Zod, soporte de cookies `_fbp`/`_fbc`, parámetros UTM y protección antispam.
- **Sin Dependencia de Servidor**: 100 % estático (SSG), desplegable en Vercel, Netlify o Cloudflare Pages sin adaptadores, funciones serverless ni proxies.
- **CRO para Colombia**: Formulario contraentrega optimizado con datos DIVIPOLA del DANE para 32 departamentos y más de 350 municipios cargados dinámicamente, validaciones en tiempo real y persistencia local de borrador.
- **CompatChecker Interactivo**: Herramienta de 2 preguntas que diagnostica la compatibilidad del taladro y lámina del cliente, reduciendo drásticamente las devoluciones.
- **Identidad Visual de Taller**: Paleta de colores acero (`#1E2226`), concreto (`#ECEAE6`), hierro (`#2B2F33`) y CTA naranja (`#FF6A13`), tipografías Barlow Condensed, Inter y JetBrains Mono, separadores diagonales con línea de corte láser y microinteracciones de scroll.

---

## Inicio Rápido

### 1. Requisitos Previos

- **Node.js**: Versión 20+ o 22+ LTS recomendada.
- **pnpm**: Versión 10+ o 12+.

### 2. Instalación de Dependencias

```bash
pnpm install
```

### 3. Configuración de Variables de Entorno

Copia el archivo de plantilla `.env.example` como `.env`:

```bash
cp .env.example .env
```

Configura las credenciales de tu campaña en NexoBite:

```env
PUBLIC_NEXOBITE_API_URL=https://api.nexobite.com/api/v1/public/dropshipping/campana-hexacut-pro/leads
PUBLIC_NEXOBITE_PRODUCT_ID=98745
PUBLIC_NEXOBITE_CAMPAIGN_SLUG=campana-hexacut-pro
```

> **Importante:** La compilación (`pnpm build`) valida estas variables en `src/lib/env.ts` mediante Zod. Si falta alguna variable obligatoria, el build se detendrá con un mensaje claro de error.

### 4. Modo Desarrollo

```bash
pnpm dev
```

Abre tu navegador en `http://localhost:4321`.

---

## Cómo Personalizar la Tienda

### 1. Cambiar Precios y Packs

Edita el archivo `src/config/tienda.ts`:

```typescript
export const configTienda = {
  nombreTienda: 'ViralyShop',
  whatsappSoporte: '573001234567', // Teléfono en formato internacional para soporte
  // ...
  producto: {
    precio: 99900,
    precioAnterior: 200000,
    ahorro: 100100,
  },
  packs: [
    {
      id: 'pack-1',
      nombre: '1 Unidad',
      precio: 99900,
      // ...
    },
    {
      id: 'pack-2',
      nombre: 'Pack 2 unidades',
      precio: 169900,
      // ...
    }
  ]
};
```

Todos los componentes de precios, resumen, tarjetas de pack y payload se actualizarán de forma sincronizada y automática.

### 2. Confirmar Especificaciones Técnicas

En `src/config/tienda.ts`, dentro de `configTienda.producto.especificaciones`, las medidas físicas vienen marcadas inicialmente como `"POR CONFIRMAR"` para cumplir las normas de honestidad técnica. En desarrollo (`pnpm dev`) verás un banner recordatorio.

Cuando valides tu lote físico, reemplaza los valores:

```typescript
especificaciones: {
  grosorMaximo: '1,2 mm en zinc/aluminio (0,8 mm en acero)',
  materiales: 'Zinc, lámina galvanizada, aluminio y hojalata',
  acople: 'Vástago hexagonal estándar de 6,35 mm (1/4")',
  velocidadRecomendada: '1.500 a 3.000 RPM',
  compatibilidad: 'Taladros con mandril estándar de 10 a 13 mm',
  peso: 'Aprox. 450 gramos',
}
```

### 3. Reemplazar Imágenes por las Fotos Generadas

En la carpeta `src/assets/img/` se encuentran los 14 placeholders en formato WebP con dimensiones y proporciones exactas.

Consulta el documento [docs/IMAGENES.md](file:///c:/Users/garci/OneDrive/Documentos/WS-NEXOBITE/Dropshipping/taladro/docs/IMAGENES.md) para acceder a los prompts de generación con IA (Imagen 3, Flux, Midjourney) listos para copiar y pegar. Una vez generadas tus fotos, guárdalas con el mismo nombre en `src/assets/img/` y Astro las optimizará automáticamente.

---

## Prueba del Endpoint de NexoBite

Para comprobar la conectividad del contrato de envío sin abrir el navegador, ejecuta:

```bash
pnpm test:pedido
```

Este script enviará un payload de prueba a tu `PUBLIC_NEXOBITE_API_URL` con formato ISO 8601 UTC, código de pedido de Bogotá y estructura estricta de NexoBite Leads.

---

## Despliegue en Producción (100 % Estático)

### Compilación Local

```bash
pnpm build
```

Genera la carpeta `dist/` con archivos HTML, CSS y JS 100 % estáticos y optimizados.

### Despliegue en Vercel
1. Conecta el repositorio de Git en el panel de Vercel.
2. Framework Preset: **Astro**.
3. Build Command: `pnpm build`
4. Output Directory: `dist`
5. Configura las variables de entorno `PUBLIC_NEXOBITE_API_URL`, `PUBLIC_NEXOBITE_PRODUCT_ID` y `PUBLIC_NEXOBITE_CAMPAIGN_SLUG` en la configuración del proyecto.

### Despliegue en Netlify
1. Conecta el repositorio en Netlify.
2. Build command: `pnpm build`
3. Publish directory: `dist`
4. Agrega las variables de entorno en **Site configuration > Environment variables**.

### Despliegue en Cloudflare Pages
1. Selecciona **Direct Upload** o integración Git.
2. Build command: `pnpm build`
3. Output directory: `dist`
4. Añade las variables de entorno correspondientes.

---

## Estructura del Proyecto

```
├── docs/
│   └── IMAGENES.md                 # Prompts, reglas y proporciones de las 14 imágenes
├── scripts/
│   ├── generate-placeholders.js     # Generador de placeholders WebP con Sharp
│   └── test-pedido.js               # Script para probar el envío directo a NexoBite
├── src/
│   ├── assets/img/                 # 14 placeholders WebP en proporciones 4:5, 1:1 y 4:3
│   ├── components/
│   │   ├── islas/                  # Islas Preact con @preact/signals
│   │   │   ├── CompatChecker.tsx   # Comprobador interactivo de compatibilidad
│   │   │   ├── OrderForm.tsx       # Formulario contraentrega y fetch a NexoBite
│   │   │   ├── OrderSelector.tsx   # Selector de pack en Hero
│   │   │   ├── PackSelector.tsx    # Selector de pack en Sección 14
│   │   │   └── StickyBar.tsx       # Barra flotante móvil reactiva al scroll
│   │   ├── secciones/              # 18 secciones en Astro estático puro
│   │   └── ui/                     # Separadores diagonales de corte
│   ├── config/
│   │   └── tienda.ts               # Precios, textos, packs, especificaciones y WhatsApp
│   ├── content/                    # Colecciones de contenido (Astro Content Layer)
│   │   ├── faqs.json               # 7 preguntas frecuentes exactas
│   │   ├── producto.json           # Datos de kit, comparativa y usos
│   │   └── testimonios.json        # 6 reseñas auténticas de clientes en Colombia
│   ├── data/
│   │   └── colombia.json           # Catálogo DIVIPOLA DANE (32 departamentos + Bogotá)
│   ├── layouts/
│   │   └── Base.astro              # Layout base con SEO, OpenGraph y JSON-LD
│   ├── lib/
│   │   ├── env.ts                  # Validación de variables de entorno con Zod
│   │   ├── pedido-schema.ts        # Esquema Zod de validación y contrato NexoBite
│   │   ├── store.ts                # Signals de Preact para selección global de packs
│   │   └── tracking.ts             # Captura de UTM, fbclid, cookies _fbp/_fbc y eventos
│   ├── pages/
│   │   ├── index.astro             # Landing page completa
│   │   ├── gracias.astro           # Confirmación de pedido con número copiable
│   │   ├── envios.astro            # Política de despachos en Colombia
│   │   ├── cambios-y-devoluciones.astro # Retracto de 5 días (Ley 1480 de 2011)
│   │   ├── garantia.astro          # Términos de garantía de 30 días
│   │   ├── privacidad.astro        # Hábeas Data (Ley 1581 de 2012)
│   │   └── terminos.astro          # Términos y condiciones de uso
│   └── styles/
│       └── global.css              # Tokens de color, fuentes y animación en Tailwind v4
└── astro.config.mjs
```

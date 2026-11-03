import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('src/assets/img');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const images = [
  { name: 'hero-producto.webp', width: 1080, height: 1350, ratio: '4:5' },
  { name: 'hero-uso.webp', width: 1080, height: 1350, ratio: '4:5' },
  { name: 'problema-tijeras.webp', width: 1080, height: 1080, ratio: '1:1' },
  { name: 'paso-1-acopla.webp', width: 1080, height: 1080, ratio: '1:1' },
  { name: 'paso-2-apoya.webp', width: 1080, height: 1080, ratio: '1:1' },
  { name: 'paso-3-corta.webp', width: 1080, height: 1080, ratio: '1:1' },
  { name: 'kit-incluye.webp', width: 1080, height: 1080, ratio: '1:1' },
  { name: 'uso-techo.webp', width: 1200, height: 900, ratio: '4:3' },
  { name: 'uso-canal.webp', width: 1200, height: 900, ratio: '4:3' },
  { name: 'uso-ducto.webp', width: 1200, height: 900, ratio: '4:3' },
  { name: 'uso-manualidad.webp', width: 1200, height: 900, ratio: '4:3' },
  { name: 'resultado-piezas.webp', width: 1080, height: 1350, ratio: '4:5' },
  { name: 'seguridad-epp.webp', width: 1200, height: 900, ratio: '4:3' },
  { name: 'regalo-navidad.webp', width: 1080, height: 1350, ratio: '4:5' },
  // Formato visual (slides 2:3)
  { name: 'slide-hero.webp', width: 1024, height: 1536, ratio: '2:3' },
  { name: 'slide-beneficios.webp', width: 1024, height: 1536, ratio: '2:3' },
  { name: 'slide-transformacion.webp', width: 1024, height: 1536, ratio: '2:3' },
  { name: 'slide-oferta.webp', width: 1024, height: 1536, ratio: '2:3' },
];

// Posters de los videos (9:16) en public/video
const posters = [
  { name: 'video-demo-poster.webp', width: 720, height: 1280, ratio: '9:16' },
  { name: 'video-usos-poster.webp', width: 720, height: 1280, ratio: '9:16' },
];

// No pisa archivos existentes (pueden ser las imágenes reales); usa --force para regenerar todo
const force = process.argv.includes('--force');

async function generate() {
  console.log('Generando placeholders WebP...');
  const posterDir = path.resolve('public/video');
  fs.mkdirSync(posterDir, { recursive: true });
  for (const img of [...images, ...posters]) {
    const filePath = path.join(img.name.includes('poster') ? posterDir : outputDir, img.name);
    if (fs.existsSync(filePath) && !force) {
      console.log(`- ${img.name} ya existe, se conserva`);
      continue;
    }
    const svg = `
      <svg width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2B2F33" />
            <stop offset="100%" stop-color="#1E2226" />
          </linearGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" stroke-width="1" stroke-opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect x="40" y="40" width="${img.width - 80}" height="${img.height - 80}" fill="none" stroke="#FF6A13" stroke-width="4" stroke-dasharray="16 8" rx="20"/>
        
        <circle cx="${img.width / 2}" cy="${img.height / 2 - 80}" r="60" fill="#FF6A13" fill-opacity="0.1" stroke="#FF6A13" stroke-width="3" />
        <path d="M ${img.width / 2 - 25} ${img.height / 2 - 80} L ${img.width / 2 + 25} ${img.height / 2 - 80} M ${img.width / 2} ${img.height / 2 - 105} L ${img.width / 2} ${img.height / 2 - 55}" stroke="#FF6A13" stroke-width="4" stroke-linecap="round"/>

        <text x="50%" y="${img.height / 2 + 30}" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          ${img.name}
        </text>
        <text x="50%" y="${img.height / 2 + 80}" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#9CA3AF" text-anchor="middle">
          ${img.width} × ${img.height} px (${img.ratio})
        </text>
        <text x="50%" y="${img.height / 2 + 130}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600" fill="#FFB800" text-anchor="middle">
          [PLACEHOLDER — Ver docs/IMAGENES.md para generar]
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(filePath);
    console.log(`✓ ${img.name} (${img.width}x${img.height})`);
  }

  // Also create a dummy video poster or placeholder video if needed in public/videos
  const videosDir = path.resolve('public/videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  console.log('Placeholders generados exitosamente.');
}

generate().catch(console.error);

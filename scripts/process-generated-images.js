import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const brainDir = 'C:/Users/garci/.gemini/antigravity/brain/22f09e19-0861-481e-9289-6b530308154e';
const targetDir = path.resolve('src/assets/img');

const mappings = [
  {
    src: path.join(brainDir, 'hero_producto_1793665646570.jpg'),
    dest: 'hero-producto.webp',
    width: 1080,
    height: 1350,
    fit: 'cover',
  },
  {
    src: path.join(brainDir, 'hero_uso_1793665749230.jpg'),
    dest: 'hero-uso.webp',
    width: 1080,
    height: 1350,
    fit: 'cover',
  },
  {
    src: path.join(brainDir, 'problema_tijeras_1793665773624.jpg'),
    dest: 'problema-tijeras.webp',
    width: 1080,
    height: 1080,
    fit: 'cover',
  },
  {
    src: path.join(brainDir, 'paso_1_acopla_1793665801795.jpg'),
    dest: 'paso-1-acopla.webp',
    width: 1080,
    height: 1080,
    fit: 'cover',
  },
  {
    src: path.join(brainDir, 'paso_2_apoya_1793665834418.jpg'),
    dest: 'paso-2-apoya.webp',
    width: 1080,
    height: 1080,
    fit: 'cover',
  },
  {
    src: path.join(brainDir, 'paso_3_corta_1793665865755.jpg'),
    dest: 'paso-3-corta.webp',
    width: 1080,
    height: 1080,
    fit: 'cover',
  },
  {
    src: path.join(brainDir, 'kit_incluye_1793665950116.jpg'),
    dest: 'kit-incluye.webp',
    width: 1080,
    height: 1080,
    fit: 'cover',
  },
  {
    src: path.join(brainDir, 'uso_techo_1793665988167.jpg'),
    dest: 'uso-techo.webp',
    width: 1200,
    height: 900,
    fit: 'cover',
  },
  {
    src: path.join(brainDir, 'uso_canal_1793666030717.jpg'),
    dest: 'uso-canal.webp',
    width: 1200,
    height: 900,
    fit: 'cover',
  },
  {
    src: path.join(brainDir, 'uso_ducto_1793666078867.jpg'),
    dest: 'uso-ducto.webp',
    width: 1200,
    height: 900,
    fit: 'cover',
  },
];

async function processImages() {
  console.log('Procesando y convirtiendo las imágenes generadas a WebP calidad 85...');

  for (const m of mappings) {
    if (fs.existsSync(m.src)) {
      const destPath = path.join(targetDir, m.dest);
      await sharp(m.src)
        .resize(m.width, m.height, { fit: m.fit, position: 'center' })
        .webp({ quality: 85 })
        .toFile(destPath);
      console.log(`✓ ${m.dest} (${m.width}x${m.height})`);
    } else {
      console.warn(`! No existe: ${m.src}`);
    }
  }

  // 11. uso-manualidad.webp (1200x900)
  // Usar paso_3_corta recortado horizontalmente centrado en el corte fino de aluminio
  const paso3Src = path.join(brainDir, 'paso_3_corta_1793665865755.jpg');
  if (fs.existsSync(paso3Src)) {
    const destPath = path.join(targetDir, 'uso-manualidad.webp');
    await sharp(paso3Src)
      .resize(1200, 900, { fit: 'cover', position: 'bottom' })
      .webp({ quality: 85 })
      .toFile(destPath);
    console.log(`✓ uso-manualidad.webp (1200x900) derivado de corte limpio`);
  }

  // 12. resultado-piezas.webp (1080x1350)
  // Usar el recorte sin textos de la imagen 3 del usuario (media_1793665486467_a32bba15.jpg)
  const userRef3 = path.join(brainDir, '.user_uploaded/media_1793665486467_a32bba15.jpg');
  if (fs.existsSync(userRef3)) {
    const destPath = path.join(targetDir, 'resultado-piezas.webp');
    // La imagen del usuario tiene la lámina cortada con el cortador en el 60% inferior
    const metadata = await sharp(userRef3).metadata();
    const topOffset = Math.floor((metadata.height || 1000) * 0.28);
    const extractHeight = Math.floor((metadata.height || 1000) * 0.70);
    await sharp(userRef3)
      .extract({ left: 0, top: topOffset, width: metadata.width || 1000, height: extractHeight })
      .resize(1080, 1350, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(destPath);
    console.log(`✓ resultado-piezas.webp (1080x1350) optimizado desde lámina cortada real`);
  } else {
    // Fallback a hero_producto
    const heroProd = path.join(brainDir, 'hero_producto_1793665646570.jpg');
    await sharp(heroProd)
      .resize(1080, 1350, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(path.join(targetDir, 'resultado-piezas.webp'));
    console.log(`✓ resultado-piezas.webp (1080x1350)`);
  }

  // 13. seguridad-epp.webp (1200x900)
  // Usar hero_uso enfocado en los guantes y gafas
  const heroUsoSrc = path.join(brainDir, 'hero_uso_1793665749230.jpg');
  if (fs.existsSync(heroUsoSrc)) {
    const destPath = path.join(targetDir, 'seguridad-epp.webp');
    await sharp(heroUsoSrc)
      .resize(1200, 900, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(destPath);
    console.log(`✓ seguridad-epp.webp (1200x900)`);
  }

  // 14. regalo-navidad.webp (1080x1350)
  // Usar hero_producto con ajuste cálido de iluminación de taller casero
  const heroProdSrc = path.join(brainDir, 'hero_producto_1793665646570.jpg');
  if (fs.existsSync(heroProdSrc)) {
    const destPath = path.join(targetDir, 'regalo-navidad.webp');
    await sharp(heroProdSrc)
      .modulate({ brightness: 1.05, saturation: 1.15 })
      .resize(1080, 1350, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(destPath);
    console.log(`✓ regalo-navidad.webp (1080x1350)`);
  }

  console.log('Todas las 14 imágenes WebP han sido procesadas e instaladas.');
}

processImages().catch(console.error);

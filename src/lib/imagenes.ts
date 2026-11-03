import type { ImageMetadata } from 'astro';

// Importación directa de los 14 activos WebP
import heroProducto from '../assets/img/hero-producto.webp';
import heroUso from '../assets/img/hero-uso.webp';
import problemaTijeras from '../assets/img/problema-tijeras.webp';
import paso1Acopla from '../assets/img/paso-1-acopla.webp';
import paso2Apoya from '../assets/img/paso-2-apoya.webp';
import paso3Corta from '../assets/img/paso-3-corta.webp';
import kitIncluye from '../assets/img/kit-incluye.webp';
import usoTecho from '../assets/img/uso-techo.webp';
import usoCanal from '../assets/img/uso-canal.webp';
import usoDucto from '../assets/img/uso-ducto.webp';
import usoManualidad from '../assets/img/uso-manualidad.webp';
import resultadoPiezas from '../assets/img/resultado-piezas.webp';
import seguridadEpp from '../assets/img/seguridad-epp.webp';
import regaloNavidad from '../assets/img/regalo-navidad.webp';

// Resuelve un archivo de src/assets/img por nombre (lo usa la colección "slides")
const todasLasImagenes = import.meta.glob<{ default: ImageMetadata }>('../assets/img/*.webp', { eager: true });

export function imagenPorArchivo(archivo: string): ImageMetadata {
  const modulo = todasLasImagenes[`../assets/img/${archivo}`];
  if (!modulo) throw new Error(`Imagen no encontrada en src/assets/img: ${archivo}`);
  return modulo.default;
}

export interface ImagenMapeada {
  id: string;
  archivo: string;
  meta: ImageMetadata;
  alt: string;
  seccion: string;
  dimensiones: { ancho: number; alto: number };
  proporcion: '4:5' | '1:1' | '4:3';
}

export const catalogoImagenes: Record<string, ImagenMapeada> = {
  heroProducto: {
    id: 'hero-producto',
    archivo: 'hero-producto.webp',
    meta: heroProducto,
    alt: 'Cortadora de Lámina montada en taladro con corte curvo sobre lámina de zinc',
    seccion: 'Sección 3: Hero Principal',
    dimensiones: { ancho: 1080, alto: 1350 },
    proporcion: '4:5',
  },
  heroUso: {
    id: 'hero-uso',
    archivo: 'hero-uso.webp',
    meta: heroUso,
    alt: 'Operario con guantes y gafas guiando el corte de lámina galvanizada sujeta al banco',
    seccion: 'Sección 3: Hero / Poster del video',
    dimensiones: { ancho: 1080, alto: 1350 },
    proporcion: '4:5',
  },
  problemaTijeras: {
    id: 'problema-tijeras',
    archivo: 'problema-tijeras.webp',
    meta: problemaTijeras,
    alt: 'Mano fatigada sosteniendo tijeras manuales frente a lámina torcida y deformada',
    seccion: 'Sección 5: El Problema',
    dimensiones: { ancho: 1080, alto: 1080 },
    proporcion: '1:1',
  },
  paso1Acopla: {
    id: 'paso-1-acopla',
    archivo: 'paso-1-acopla.webp',
    meta: paso1Acopla,
    alt: 'Inserción del acople hexagonal en el mandril del taladro',
    seccion: 'Sección 6: Cómo Funciona (Paso 1)',
    dimensiones: { ancho: 1080, alto: 1080 },
    proporcion: '1:1',
  },
  paso2Apoya: {
    id: 'paso-2-apoya',
    archivo: 'paso-2-apoya.webp',
    meta: paso2Apoya,
    alt: 'Varilla estabilizadora de apoyo colocada sobre el borde de la lámina',
    seccion: 'Sección 6: Cómo Funciona (Paso 2)',
    dimensiones: { ancho: 1080, alto: 1080 },
    proporcion: '1:1',
  },
  paso3Corta: {
    id: 'paso-3-corta',
    archivo: 'paso-3-corta.webp',
    meta: paso3Corta,
    alt: 'Corte recto guiado sobre lámina con tira metálica enrollándose a un costado',
    seccion: 'Sección 6: Cómo Funciona (Paso 3)',
    dimensiones: { ancho: 1080, alto: 1080 },
    proporcion: '1:1',
  },
  kitIncluye: {
    id: 'kit-incluye',
    archivo: 'kit-incluye.webp',
    meta: kitIncluye,
    alt: 'Knolling fotográfico cenital del cortador, ruedas de cizalla y varilla de apoyo',
    seccion: 'Sección 7: Qué Incluye',
    dimensiones: { ancho: 1080, alto: 1080 },
    proporcion: '1:1',
  },
  usoTecho: {
    id: 'uso-techo',
    archivo: 'uso-techo.webp',
    meta: usoTecho,
    alt: 'Corte de teja de zinc ondulada en patio residencial colombiano',
    seccion: 'Sección 8: Qué Puedes Hacer',
    dimensiones: { ancho: 1200, alto: 900 },
    proporcion: '4:3',
  },
  usoCanal: {
    id: 'uso-canal',
    archivo: 'uso-canal.webp',
    meta: usoCanal,
    alt: 'Ajuste de longitud en canal metálico pluvial en terraza',
    seccion: 'Sección 8: Qué Puedes Hacer',
    dimensiones: { ancho: 1200, alto: 900 },
    proporcion: '4:3',
  },
  usoDucto: {
    id: 'uso-ducto',
    archivo: 'uso-ducto.webp',
    meta: usoDucto,
    alt: 'Instalador con EPP cortando lámina galvanizada para ducto de ventilación',
    seccion: 'Sección 8: Qué Puedes Hacer',
    dimensiones: { ancho: 1200, alto: 900 },
    proporcion: '4:3',
  },
  usoManualidad: {
    id: 'uso-manualidad',
    archivo: 'uso-manualidad.webp',
    meta: usoManualidad,
    alt: 'Corte de figura curva en lámina de aluminio para herrería ligera y bricolaje',
    seccion: 'Sección 8: Qué Puedes Hacer',
    dimensiones: { ancho: 1200, alto: 900 },
    proporcion: '4:3',
  },
  resultadoPiezas: {
    id: 'resultado-piezas',
    archivo: 'resultado-piezas.webp',
    meta: resultadoPiezas,
    alt: 'Láminas metálicas recién cortadas limpiamente junto al accesorio',
    seccion: 'Sección 11: Resultado',
    dimensiones: { ancho: 1080, alto: 1350 },
    proporcion: '4:5',
  },
  seguridadEpp: {
    id: 'seguridad-epp',
    archivo: 'seguridad-epp.webp',
    meta: seguridadEpp,
    alt: 'Equipo de protección reglamentario: gafas transparentes, guantes de carnaza y prensas',
    seccion: 'Sección 12: Seguridad en Taller',
    dimensiones: { ancho: 1200, alto: 900 },
    proporcion: '4:3',
  },
  regaloNavidad: {
    id: 'regalo-navidad',
    archivo: 'regalo-navidad.webp',
    meta: regaloNavidad,
    alt: 'Presentación de regalo con iluminación cálida de taller casero',
    seccion: 'Sección 13: Bloque Regalo',
    dimensiones: { ancho: 1080, alto: 1350 },
    proporcion: '4:5',
  },
};

export {
  heroProducto,
  heroUso,
  problemaTijeras,
  paso1Acopla,
  paso2Apoya,
  paso3Corta,
  kitIncluye,
  usoTecho,
  usoCanal,
  usoDucto,
  usoManualidad,
  resultadoPiezas,
  seguridadEpp,
  regaloNavidad,
};

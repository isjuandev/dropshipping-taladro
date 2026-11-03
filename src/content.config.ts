import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const testimonios = defineCollection({
  loader: file('src/content/testimonios.json'),
  schema: z.object({
    id: z.string(),
    nombre: z.string(),
    ciudad: z.string(),
    oficio: z.string(),
    texto: z.string(),
    estrellas: z.number().min(1).max(5),
    foto: z.string().optional(),
    verificado: z.boolean().default(true),
  }),
});

const faqs = defineCollection({
  loader: file('src/content/faqs.json'),
  schema: z.object({
    id: z.string(),
    pregunta: z.string(),
    respuesta: z.string(),
    activo: z.boolean().default(true),
  }),
});

// Bloques de la landing en orden de lectura. Reordena con `orden` o apaga con `activo: false`.
const cta = z.object({ texto: z.string(), origen: z.string() });

const slides = defineCollection({
  loader: file('src/content/slides.json'),
  schema: z
    .object({
      id: z.string(),
      orden: z.number(),
      activo: z.boolean().default(true),
      tipo: z.enum(['imagen', 'video', 'bloque']),
      // Solo se muestra si la condición se cumple en src/config/tienda.ts
      requiere: z.enum(['temporadaRegalo', 'ugc']).optional(),
      // tipo 'bloque': sección con diseño propio
      bloque: z
        .enum(['marquee', 'comoFunciona', 'usos', 'incluye', 'comparativa', 'seguridad', 'ugc', 'packs'])
        .optional(),
      // tipo 'imagen'
      variante: z.enum(['normal', 'hero', 'oferta']).default('normal'),
      imagen: z.string().optional(), // archivo dentro de src/assets/img
      alt: z.string().optional(),
      posicionTexto: z.enum(['arriba', 'abajo']).default('arriba'),
      textoEnImagen: z.boolean().default(false),
      chips: z.array(z.string()).default([]),
      // tipo 'video'
      mp4: z.string().optional(),
      webm: z.string().optional(),
      poster: z.string().optional(),
      vtt: z.string().optional(),
      ariaLabel: z.string().optional(),
      videoObject: z
        .object({ nombre: z.string(), descripcion: z.string(), fecha: z.string(), duracion: z.string() })
        .optional(),
      titular: z.string().optional(),
      subtitulo: z.string().optional(),
      cta: cta.optional(),
    })
    .superRefine((d, ctx) => {
      const falta = (campo: string) => ctx.addIssue({ code: 'custom', message: `slides/${d.id}: falta ${campo}` });
      if (d.tipo === 'imagen' && (!d.imagen || !d.alt || !d.titular)) falta('imagen, alt o titular');
      if (d.tipo === 'video' && (!d.mp4 || !d.poster || !d.titular || !d.cta)) falta('mp4, poster, titular o cta');
      if (d.tipo === 'bloque' && !d.bloque) falta('bloque');
    }),
});

const producto = defineCollection({
  loader: file('src/content/producto.json'),
  schema: z.object({
    id: z.string(),
    nombre: z.string(),
    sku: z.string(),
    precio: z.number(),
    precioAnterior: z.number(),
    ahorro: z.number(),
    rating: z.number(),
    numResenas: z.number(),
    video: z.string(),
    imagenes: z.array(z.string()).default([]),
    incluye: z.array(
      z.object({
        pieza: z.string(),
        descripcion: z.string(),
        numero: z.number(),
      })
    ),
    usos: z.array(
      z.object({
        titulo: z.string(),
        descripcion: z.string(),
        imagen: z.string(),
      })
    ),
    comparativa: z.array(
      z.object({
        criterio: z.string(),
        hexacut: z.string(),
        hexacutOk: z.boolean(),
        tijera: z.string(),
        tijeraOk: z.boolean(),
        pulidora: z.string(),
        pulidoraOk: z.boolean(),
      })
    ),
  }),
});

export const collections = { testimonios, faqs, producto, slides };

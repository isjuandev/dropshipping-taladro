import type { CollectionEntry } from 'astro:content';

export type TipoMedio = 'foto' | 'video';

// Foto o video real que un cliente envió junto con su reseña.
// Se construye a partir de la colección "testimonios" para no duplicar datos:
// el mismo medio se muestra dentro de la reseña y en la galería de clientes.
export interface MedioCliente {
  id: string; // id de la reseña a la que pertenece (resena-1, resena-2…)
  tipo: TipoMedio;
  src: string;
  poster?: string;
  alt: string;
  nombre: string;
  ciudad: string;
  estrellas: number;
  texto: string;
}

export type Testimonio = CollectionEntry<'testimonios'>['data'];

// Devuelve solo las reseñas que traen foto o video, en el orden del archivo de testimonios.
export function mediosDeTestimonios(testimonios: Testimonio[]): MedioCliente[] {
  const medios: MedioCliente[] = [];

  for (const testimonio of testimonios) {
    const media = testimonio.media;
    if (!media) continue;

    medios.push({
      id: testimonio.id,
      tipo: media.tipo,
      src: media.src,
      poster: media.poster,
      alt: media.alt,
      nombre: testimonio.nombre,
      ciudad: testimonio.ciudad,
      estrellas: testimonio.estrellas,
      texto: testimonio.texto,
    });
  }

  return medios;
}

// Texto corto para acompañar la tarjeta de la galería
export function resumenResena(texto: string, limite = 92): string {
  const limpio = texto.trim();
  if (limpio.length <= limite) return limpio;
  const corte = limpio.slice(0, limite);
  const ultimoEspacio = corte.lastIndexOf(' ');
  return (ultimoEspacio > 40 ? corte.slice(0, ultimoEspacio) : corte).replace(/[,;:.¡!]$/, '') + '…';
}

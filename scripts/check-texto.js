// Mide las palabras visibles entre la barra de anuncio y el formulario (#pedido) en dist/cortadora-de-lamina/index.html o dist/index.html.
// Uso: pnpm build && pnpm check:texto
import fs from 'node:fs';
import path from 'node:path';

const LIMITE = 200;
const rutaCortadora = path.resolve('dist/cortadora-de-lamina/index.html');
const rutaIndex = path.resolve('dist/index.html');
const archivo = fs.existsSync(rutaCortadora) ? rutaCortadora : rutaIndex;
if (!fs.existsSync(archivo)) {
  console.error('No existe el archivo HTML compilado. Ejecuta primero: pnpm build');
  process.exit(1);
}

let html = fs.readFileSync(archivo, 'utf8');

// Región: desde el cierre de la barra de anuncio hasta el formulario
const inicio = html.indexOf('</aside>');
const idPedido = html.indexOf('id="pedido"');
const fin = idPedido < 0 ? -1 : html.lastIndexOf('<', idPedido); // abre la sección #pedido
if (inicio < 0 || fin < 0) {
  console.error('No se encontró la barra de anuncio (<aside>) o #pedido en dist/index.html');
  process.exit(1);
}
let region = html.slice(inicio + '</aside>'.length, fin);

const quitar = (re) => {
  region = region.replace(re, ' ');
};

// Packs: no cuentan (marcados en Packs.astro)
quitar(/<template data-texto="ignorar-inicio"><\/template>[\s\S]*?<template data-texto="ignorar-fin"><\/template>/g);
// Plegados: solo cuenta el <summary>, no el contenido del <details>
region = region.replace(/<details\b[\s\S]*?<\/details>/g, (d) => (d.match(/<summary\b[\s\S]*?<\/summary>/) || [''])[0]);
// No visibles: scripts, estilos, svg, solo-lectores, copias aria-hidden (marquee), imágenes
quitar(/<(script|style|svg|template|noscript)\b[\s\S]*?<\/\1>/g);
quitar(/<(\w+)\b[^>]*\bclass="[^"]*\bsr-only\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g);
quitar(/<(\w+)\b[^>]*\baria-hidden="true"[^>]*>[\s\S]*?<\/\1>/g);

const texto = region
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#?\w+;/g, ' ');

// Palabra = token con al menos una letra o dígito
const palabras = texto.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t));

console.log(`Palabras visibles entre la barra de anuncio y el formulario: ${palabras.length} (límite ${LIMITE})`);
if (process.argv.includes('--detalle')) console.log(palabras.join(' '));
if (palabras.length > LIMITE) {
  console.error('✗ Supera el presupuesto de texto.');
  process.exit(1);
}
console.log('✓ Dentro del presupuesto.');

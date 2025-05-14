/**
 * Helper para manipulación de strings
 */

/**
 * Convierte un string a slug (url-friendly)
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/[^\w\-]+/g, '') // Elimina caracteres no alfanuméricos
    .replace(/\-\-+/g, '-') // Elimina guiones múltiples
    .replace(/^-+/, '') // Elimina guiones iniciales
    .replace(/-+$/, ''); // Elimina guiones finales
}

/**
 * Capitaliza la primera letra de un string
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convierte un string de kebab-case a camelCase
 */
export function kebabToCamel(text: string): string {
  return text.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convierte un string de camelCase a kebab-case
 */
export function camelToKebab(text: string): string {
  return text.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Elimina HTML de un string
 */
export function stripHtml(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, '');
}

/**
 * Trunca un string a una longitud máxima
 */
export function truncate(
  text: string,
  length: number,
  suffix: string = '...',
): string {
  if (!text || text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
}

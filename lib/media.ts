/**
 * Cache-busting centralisé pour les médias (photos de profil, camions...).
 *
 * Ajoute un paramètre de version (`?v=`) à une URL d'image. La version est
 * stockée en base (`photo_profil_version`) et incrémentée à chaque upload :
 * le navigateur est ainsi forcé de recharger l'image dès qu'elle change,
 * sans purge manuelle du cache.
 */
export function mediaUrl(
  src?: string | null,
  version?: number | string | null
): string | null {
  if (!src) return null;
  if (version === undefined || version === null || version === "") return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}v=${encodeURIComponent(String(version))}`;
}

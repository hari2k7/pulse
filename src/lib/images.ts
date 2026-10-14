/**
 * Responsive image utilities for STRANGE
 * Optimizes Pexels images per PROJECT.md Section 6 & Hard Rule 6
 */

export function getOptimizedImageUrl(url?: string, width = 600, height = 400): string {
  if (!url) return '';
  if (url.includes('images.pexels.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('h', String(height));
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('auto', 'compress');
      parsed.searchParams.set('cs', 'tinysrgb');
      return parsed.toString();
    } catch {
      return url.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
    }
  }
  return url;
}

export function getImageSrcSet(
  url?: string,
  widths: number[] = [400, 600, 900, 1200],
  aspectRatio: number = 2 / 3
): string {
  if (!url || !url.includes('images.pexels.com')) return '';
  return widths
    .map((w) => `${getOptimizedImageUrl(url, w, Math.round(w * aspectRatio))} ${w}w`)
    .join(', ');
}

export const FALLBACK_IMAGE_DATA_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%2307060D"/><circle cx="300" cy="200" r="80" stroke="%23FF7A1A" stroke-width="1.5" stroke-dasharray="6 4" fill="none" opacity="0.4"/><text x="50%" y="50%" fill="%23F3EFE8" font-family="Cinzel, Georgia, serif" font-size="20" letter-spacing="4" text-anchor="middle" dominant-baseline="middle">STRANGE EVENT</text></svg>';

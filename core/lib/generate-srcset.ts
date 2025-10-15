'use client';

const DEFAULT_SIZES = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
] as const;

/**
 * Generates a srcset string from a BigCommerce CDN image template URL
 * @param templateUrl - The image URL with {:size} placeholder
 * @param sizes - Array of widths to generate (defaults to responsive sizes)
 * @returns A srcset string with all size variants
 */
export function generateSrcSet(
  templateUrl: string,
  sizes: readonly number[] = DEFAULT_SIZES,
): string {
  return sizes.map((width) => `${templateUrl.replace('{:size}', `${width}w`)} ${width}w`).join(', ');
}

/**
 * Generates a Low Quality Image Placeholder URL
 * @param templateUrl - The image URL with {:size} placeholder
 * @returns LQIP URL with 10w size
 */
export function generateLQIP(templateUrl: string): string {
  return templateUrl.replace('{:size}', '10w');
}

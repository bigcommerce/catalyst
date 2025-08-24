/**
 * Utility functions for image URL transformations including LQIP (Low Quality Image Placeholder) generation
 */

/**
 * Interface for image transformation options
 */
export interface ImageTransformOptions {
  /**
   * Whether to generate lossy/compressed images for LQIP
   */
  enableLossy?: boolean;
  /**
   * Quality setting for lossy images (1-100)
   */
  lossyQuality?: number;
}

/**
 * Default configuration for image transformations
 */
export const DEFAULT_IMAGE_TRANSFORM_OPTIONS: Required<ImageTransformOptions> = {
  enableLossy: true,
  lossyQuality: 30,
};

/**
 * Transform a BigCommerce image URL to include lossy parameters for LQIP
 * 
 * @param url - The original image URL
 * @param options - Transform options
 * @returns The transformed URL with lossy parameters
 */
export function transformImageUrl(url: string, options: ImageTransformOptions = {}): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  const config = { ...DEFAULT_IMAGE_TRANSFORM_OPTIONS, ...options };

  if (!config.enableLossy) {
    return url;
  }

  // Check if this is a BigCommerce CDN URL that can be transformed
  if (!isBigCommerceCdnUrl(url)) {
    return url;
  }

  // If URL already has lossy parameters, don't transform again
  if (url.includes('lossy=') || url.includes('quality=')) {
    return url;
  }

  // Add lossy parameter to the URL
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}lossy=true&quality=${config.lossyQuality}`;
}

/**
 * Check if a URL is from the BigCommerce CDN and can be transformed
 * 
 * @param url - The URL to check
 * @returns True if the URL can be transformed
 */
function isBigCommerceCdnUrl(url: string): boolean {
  if (!url) return false;
  
  // Check for BigCommerce CDN patterns
  const cdnPatterns = [
    /cdn\d*\.bigcommerce\.com/,
    /bigcommerce-.*\.s3\.amazonaws\.com/,
    /store-.*\.mybigcommerce\.com/,
  ];

  return cdnPatterns.some(pattern => pattern.test(url));
}

/**
 * Transform image objects in API responses to include LQIP URLs
 * 
 * @param data - The API response data
 * @param options - Transform options
 * @returns Transformed data with LQIP URLs
 */
export function transformImageUrls(data: any, options: ImageTransformOptions = {}): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => transformImageUrls(item, options));
  }

  const result = { ...data };

  // Transform specific image URL fields
  const imageUrlFields = ['url', 'src', 'urlOriginal', 'urlStandard', 'urlThumbnail'];
  
  for (const field of imageUrlFields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = transformImageUrl(result[field], options);
    }
  }

  // Transform nested objects
  for (const [key, value] of Object.entries(result)) {
    if (value && typeof value === 'object') {
      result[key] = transformImageUrls(value, options);
    }
  }

  return result;
}
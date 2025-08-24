import {
  DEFAULT_IMAGE_TRANSFORM_OPTIONS,
  transformImageUrl,
  transformImageUrls,
} from '../src/utils/imageTransforms';

describe('Image Transform Utils', () => {
  describe('transformImageUrl', () => {
    it('should add lossy parameters to BigCommerce CDN URLs', () => {
      const url = 'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg';
      const result = transformImageUrl(url);

      expect(result).toBe(
        `${url}?lossy=true&quality=${DEFAULT_IMAGE_TRANSFORM_OPTIONS.lossyQuality}`,
      );
    });

    it('should not transform non-BigCommerce URLs', () => {
      const url = 'https://example.com/image.jpg';
      const result = transformImageUrl(url);

      expect(result).toBe(url);
    });

    it('should not transform URLs that already have lossy parameters', () => {
      const url =
        'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg?lossy=true';
      const result = transformImageUrl(url);

      expect(result).toBe(url);
    });

    it('should respect custom quality settings', () => {
      const url = 'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg';
      const result = transformImageUrl(url, { lossyQuality: 50 });

      expect(result).toBe(`${url}?lossy=true&quality=50`);
    });

    it('should handle URLs with existing query parameters', () => {
      const url =
        'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg?width=100';
      const result = transformImageUrl(url);

      expect(result).toBe(
        `${url}&lossy=true&quality=${DEFAULT_IMAGE_TRANSFORM_OPTIONS.lossyQuality}`,
      );
    });

    it('should not transform when enableLossy is false', () => {
      const url = 'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg';
      const result = transformImageUrl(url, { enableLossy: false });

      expect(result).toBe(url);
    });
  });

  describe('transformImageUrls', () => {
    it('should transform image URLs in nested objects', () => {
      const data = {
        product: {
          name: 'Test Product',
          image: {
            url: 'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg',
          },
        },
      };

      const result = transformImageUrls(data);

      expect(result.product.image.url).toContain('lossy=true');
    });

    it('should transform image URLs in arrays', () => {
      const data = {
        products: [
          {
            image: {
              url: 'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg',
            },
          },
          {
            image: {
              url: 'https://cdn11.bigcommerce.com/s-123abc/products/789/images/012/image.jpg',
            },
          },
        ],
      };

      const result = transformImageUrls(data);

      expect(result.products[0].image.url).toContain('lossy=true');
      expect(result.products[1].image.url).toContain('lossy=true');
    });

    it('should handle null and undefined values gracefully', () => {
      expect(transformImageUrls(null)).toBe(null);
      expect(transformImageUrls(undefined)).toBe(undefined);

      const data = {
        image: null,
        url: undefined,
      };

      const result = transformImageUrls(data);

      expect(result.image).toBe(null);
      expect(result.url).toBe(undefined);
    });
  });
});

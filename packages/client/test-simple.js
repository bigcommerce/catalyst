// Simple JavaScript version for testing
const DEFAULT_IMAGE_TRANSFORM_OPTIONS = {
  enableLossy: true,
  lossyQuality: 30,
};

function isBigCommerceCdnUrl(url) {
  if (!url) return false;
  
  const cdnPatterns = [
    /cdn\d*\.bigcommerce\.com/,
    /bigcommerce-.*\.s3\.amazonaws\.com/,
    /store-.*\.mybigcommerce\.com/,
  ];

  return cdnPatterns.some(pattern => pattern.test(url));
}

function transformImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  const config = { ...DEFAULT_IMAGE_TRANSFORM_OPTIONS, ...options };

  if (!config.enableLossy) {
    return url;
  }

  if (!isBigCommerceCdnUrl(url)) {
    return url;
  }

  if (url.includes('lossy=') || url.includes('quality=')) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}lossy=true&quality=${config.lossyQuality}`;
}

function transformImageUrls(data, options = {}) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => transformImageUrls(item, options));
  }

  const result = { ...data };
  const imageUrlFields = ['url', 'src', 'urlOriginal', 'urlStandard', 'urlThumbnail'];
  
  for (const field of imageUrlFields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = transformImageUrl(result[field], options);
    }
  }

  for (const [key, value] of Object.entries(result)) {
    if (value && typeof value === 'object') {
      result[key] = transformImageUrls(value, options);
    }
  }

  return result;
}

// Test the functionality
console.log('Testing image transforms...');

// Test 1: Basic URL transformation
const testUrl = 'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg';
const transformed = transformImageUrl(testUrl);
const expected = `${testUrl}?lossy=true&quality=${DEFAULT_IMAGE_TRANSFORM_OPTIONS.lossyQuality}`;

console.log('Test 1 - Basic URL transformation:');
console.log('  Input:', testUrl);
console.log('  Output:', transformed);
console.log('  Expected:', expected);
console.log('  ✓ Pass:', transformed === expected);

// Test 2: Non-BigCommerce URL (should not transform)
const externalUrl = 'https://example.com/image.jpg';
const untransformed = transformImageUrl(externalUrl);

console.log('\nTest 2 - External URL (should not transform):');
console.log('  Input:', externalUrl);
console.log('  Output:', untransformed);
console.log('  ✓ Pass:', untransformed === externalUrl);

// Test 3: URL with existing query params
const urlWithParams = 'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg?width=100';
const transformedWithParams = transformImageUrl(urlWithParams);
const expectedWithParams = `${urlWithParams}&lossy=true&quality=${DEFAULT_IMAGE_TRANSFORM_OPTIONS.lossyQuality}`;

console.log('\nTest 3 - URL with existing query params:');
console.log('  Input:', urlWithParams);
console.log('  Output:', transformedWithParams);
console.log('  Expected:', expectedWithParams);
console.log('  ✓ Pass:', transformedWithParams === expectedWithParams);

// Test 4: Nested object transformation
const testData = {
  product: {
    name: 'Test Product',
    image: {
      url: 'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg'
    }
  }
};

const transformedData = transformImageUrls(testData);

console.log('\nTest 4 - Nested object transformation:');
console.log('  Original URL:', testData.product.image.url);
console.log('  Transformed URL:', transformedData.product.image.url);
console.log('  ✓ Pass:', transformedData.product.image.url.includes('lossy=true'));

// Test 5: Disabled lossy
const disabledTransform = transformImageUrl(testUrl, { enableLossy: false });

console.log('\nTest 5 - Disabled lossy:');
console.log('  Input:', testUrl);
console.log('  Output:', disabledTransform);
console.log('  ✓ Pass:', disabledTransform === testUrl);

console.log('\nAll tests completed!');
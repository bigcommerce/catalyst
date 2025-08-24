#!/usr/bin/env node

// Simple test runner for image transforms
const { transformImageUrl, transformImageUrls, DEFAULT_IMAGE_TRANSFORM_OPTIONS } = require('./src/utils/imageTransforms');

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

// Test 3: Nested object transformation
const testData = {
  product: {
    name: 'Test Product',
    image: {
      url: 'https://cdn11.bigcommerce.com/s-123abc/products/123/images/456/image.jpg'
    }
  }
};

const transformedData = transformImageUrls(testData);

console.log('\nTest 3 - Nested object transformation:');
console.log('  Original URL:', testData.product.image.url);
console.log('  Transformed URL:', transformedData.product.image.url);
console.log('  ✓ Pass:', transformedData.product.image.url.includes('lossy=true'));

console.log('\nAll tests completed!');
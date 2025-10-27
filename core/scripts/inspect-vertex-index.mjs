#!/usr/bin/env node
/**
 * Inspect Vertex AI index to understand data structure
 * Examines how categories and brands are indexed
 */

import { ProductServiceClient } from '@google-cloud/retail';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './core/.env.local' });

const projectId = process.env.GCP_PROJECT_ID;
const location = process.env.VERTEX_RETAIL_LOCATION;
const catalog = process.env.VERTEX_RETAIL_CATALOG;

if (!projectId || !location || !catalog) {
  console.error('❌ Missing required environment variables');
  console.error('Required: GCP_PROJECT_ID, VERTEX_RETAIL_LOCATION, VERTEX_RETAIL_CATALOG');
  process.exit(1);
}

const catalogPath = `projects/${projectId}/locations/${location}/catalogs/${catalog}`;
const branch = `${catalogPath}/branches/1`;

console.log('📍 Configuration:', {
  projectId,
  location,
  catalog,
  catalogPath,
  branch,
});

// Initialize the product service client
const productClient = new ProductServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

console.log('\n🔍 Fetching sample products from Vertex AI index...\n');

try {
  // List some products to see their structure
  const [products] = await productClient.listProducts({
    parent: branch,
    pageSize: 5,
  });

  console.log(`✓ Found ${products.length} sample products\n`);

  products.forEach((product, i) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Product ${i + 1}: ${product.name}`);
    console.log('='.repeat(60));
    console.log(`ID: ${product.id}`);
    console.log(`Title: ${product.title}`);

    // Check categories structure
    if (product.categories && product.categories.length > 0) {
      console.log('\nCategories:');
      product.categories.forEach((cat, idx) => {
        console.log(`  ${idx + 1}. "${cat}"`);
      });
    }

    // Check if there's a category ID field
    if (product.attributes) {
      console.log('\nAttributes:');
      Object.entries(product.attributes).forEach(([key, value]) => {
        if (key.toLowerCase().includes('category') || key.toLowerCase().includes('brand')) {
          console.log(`  ${key}:`, value);
        }
      });
    }

    // Check custom attributes
    if (product.customAttributes) {
      console.log('\nCustom Attributes:');
      Object.entries(product.customAttributes).forEach(([key, value]) => {
        if (key.toLowerCase().includes('category') || key.toLowerCase().includes('brand')) {
          console.log(`  ${key}:`, value);
        }
      });
    }

    // Check for brand
    if (product.brands && product.brands.length > 0) {
      console.log('\nBrands:');
      product.brands.forEach((brand, idx) => {
        console.log(`  ${idx + 1}. "${brand}"`);
      });
    }

    // Show all top-level fields
    console.log('\nAll product fields:', Object.keys(product).join(', '));
  });

  console.log('\n\n✅ Inspection complete!\n');
} catch (error) {
  console.error('❌ Error fetching products:', error.message);
  process.exit(1);
}

#!/usr/bin/env node
/**
 * Check what fields are available on products in Vertex AI
 */

import { SearchServiceClient } from '@google-cloud/retail';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const projectId = process.env.GCP_PROJECT_ID;
const location = process.env.VERTEX_RETAIL_LOCATION;
const catalog = process.env.VERTEX_RETAIL_CATALOG;
const placement = process.env.VERTEX_RETAIL_PLACEMENT;

if (!projectId || !location || !catalog || !placement) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const catalogPath = `projects/${projectId}/locations/${location}/catalogs/${catalog}`;
const branch = `${catalogPath}/branches/1`;
const placementPath = `projects/${projectId}/locations/${location}/catalogs/${catalog}/servingConfigs/${placement}`;

const searchClient = new SearchServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

console.log('🔍 Searching for a product to examine fields...\n');

try {
  // Get a few products
  const [results, , response] = await searchClient.search(
    {
      placement: placementPath,
      branch,
      query: '', // Empty query to get any products
      pageSize: 3,
      visitorId: 'field-check',
    },
    { autoPaginate: false },
  );

  console.log(`Found ${results.length} products\n`);

  if (results.length > 0) {
    const firstProduct = results[0].product;

    console.log('Product ID:', results[0].id);
    console.log('Product name:', firstProduct?.title);
    console.log('\n📋 All available fields on product:');
    console.log(JSON.stringify(firstProduct, null, 2));

    // Check for category-related fields
    console.log('\n🏷️  Category-related fields:');
    console.log('categories:', firstProduct?.categories);

    // Check for brand-related fields
    console.log('\n🏢 Brand-related fields:');
    console.log('brands:', firstProduct?.brands);

    // Check attributes
    console.log('\n⚙️  Attributes:');
    console.log('attributes:', firstProduct?.attributes);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
}

#!/usr/bin/env node
/**
 * Check the Vertex AI schema to see attribute types
 */

import { SearchServiceClient } from '@google-cloud/retail';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

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

console.log('🔍 Checking Vertex AI schema for attribute types...\n');

try {
  // Get a product to see its structure with ALL fields
  const [results] = await searchClient.search(
    {
      placement: placementPath,
      branch,
      query: '',
      pageSize: 1,
      visitorId: 'schema-check',
      // Request all product fields including attributes
      queryExpansionSpec: {
        condition: 'AUTO',
      },
      // This is crucial - we need to explicitly request attribute fields
      // By default, search only returns a subset of fields
    },
    { autoPaginate: false },
  );

  if (results.length > 0) {
    console.log('📋 Full result structure:');
    console.log(JSON.stringify(results[0], null, 2));

    const product = results[0].product;

    console.log('\n📋 Product structure:');
    console.log(JSON.stringify(product, null, 2));
  } else {
    console.log('❌ No products found in index');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
}

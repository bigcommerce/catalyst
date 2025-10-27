#!/usr/bin/env node
/**
 * Test script for Vertex AI Browse API
 * Tests browsing by category and brand
 */

const { SearchServiceClient } = require('@google-cloud/retail');
require('dotenv').config({ path: './.env.local' });

const projectId = process.env.GCP_PROJECT_ID;
const location = process.env.VERTEX_RETAIL_LOCATION;
const catalog = process.env.VERTEX_RETAIL_CATALOG;
const placement = process.env.VERTEX_RETAIL_PLACEMENT;

if (!projectId || !location || !catalog || !placement) {
  console.error('❌ Missing required environment variables');
  console.error('Required: GCP_PROJECT_ID, VERTEX_RETAIL_LOCATION, VERTEX_RETAIL_CATALOG, VERTEX_RETAIL_PLACEMENT');
  process.exit(1);
}

const catalogPath = `projects/${projectId}/locations/${location}/catalogs/${catalog}`;
const branch = `${catalogPath}/branches/1`;
const placementPath = `projects/${projectId}/locations/${location}/catalogs/${catalog}/servingConfigs/${placement}`;

console.log('📍 Configuration:', {
  projectId,
  location,
  catalog,
  placement,
  catalogPath,
  branch,
  placementPath,
});

// Initialize the search client
const searchClient = new SearchServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

console.log('\n🔍 Testing Vertex AI Browse API...\n');

async function runTests() {
  // Test 1: Browse by category entity ID (e.g., 23 for "Clearance")
  const categoryEntityId = 23; // Update this to match your actual category ID
  console.log(`Test 1: Browse by Category Entity ID - ${categoryEntityId}`);
  console.log('='.repeat(50));

  try {
    const [categoryResults, , categoryResponse] = await searchClient.search(
      {
        placement: placementPath,
        branch,
        query: '', // Empty query for browse mode
        filter: `(categoryEntityId: ANY("${categoryEntityId}"))`,
        pageSize: 5,
        visitorId: 'test-script',
        facetSpecs: [
          {
            facetKey: { key: 'brands' },
            limit: 10,
          },
        ],
      },
      { autoPaginate: false },
    );

    console.log(`✓ Results found: ${categoryResults.length}`);
    console.log(`✓ Total size: ${categoryResponse.totalSize || 0}`);
    console.log(`✓ Facets returned: ${categoryResponse.facets?.length || 0}`);

    if (categoryResults.length > 0) {
      console.log('\nSample product IDs:');
      categoryResults.slice(0, 3).forEach((result, i) => {
        console.log(`  ${i + 1}. ${result.id}`);
      });
    }

    if (categoryResponse.facets?.length > 0) {
      console.log('\nFacets:');
      categoryResponse.facets.forEach(facet => {
        console.log(`  - ${facet.key}: ${facet.values?.length || 0} values`);
      });
    }
  } catch (error) {
    console.error('❌ Category browse failed:', error.message);
  }

  // Test 2: Browse by brand entity ID (e.g., 40 for "UPLIFT")
  const brandEntityId = 40; // Update this to match your actual brand ID
  console.log(`\n\nTest 2: Browse by Brand Entity ID - ${brandEntityId}`);
  console.log('='.repeat(50));

  try {
    const [brandResults, , brandResponse] = await searchClient.search(
      {
        placement: placementPath,
        branch,
        query: '', // Empty query for browse mode
        filter: `(brandEntityId: ANY("${brandEntityId}"))`,
        pageSize: 5,
        visitorId: 'test-script',
        facetSpecs: [
          {
            facetKey: { key: 'categories' },
            limit: 10,
          },
          {
            facetKey: { key: 'colorFamilies' },
            limit: 10,
          },
        ],
      },
      { autoPaginate: false },
    );

    console.log(`✓ Results found: ${brandResults.length}`);
    console.log(`✓ Total size: ${brandResponse.totalSize || 0}`);
    console.log(`✓ Facets returned: ${brandResponse.facets?.length || 0}`);

    if (brandResults.length > 0) {
      console.log('\nSample product IDs:');
      brandResults.slice(0, 3).forEach((result, i) => {
        console.log(`  ${i + 1}. ${result.id}`);
      });
    }

    if (brandResponse.facets?.length > 0) {
      console.log('\nFacets:');
      brandResponse.facets.forEach(facet => {
        console.log(`  - ${facet.key}: ${facet.values?.length || 0} values`);
        if (facet.values && facet.values.length > 0) {
          facet.values.slice(0, 3).forEach(val => {
            console.log(`      - ${val.value} (${val.count})`);
          });
        }
      });
    }
  } catch (error) {
    console.error('❌ Brand browse failed:', error.message);
  }

  console.log('\n✅ Tests complete!\n');
}

runTests().catch(console.error);

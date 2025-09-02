/**
 * Example usage of @bigcommerce/catalyst-middleware-fetch
 * 
 * This example demonstrates how to use the package in different scenarios.
 */

import {
  createFetch,
  getEnvironmentInfo,
  isVercelEnvironment,
  getFetchImplementation,
} from './src/index';

/**
 * Example 1: Basic usage
 */
async function basicUsage() {
  console.log('=== Basic Usage ===');
  
  // Create a fetch function that automatically selects the right implementation
  const fetch = await createFetch();
  
  // Use it like normal fetch
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    console.log('Fetched data:', data.title);
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}

/**
 * Example 2: Environment detection
 */
async function environmentDetection() {
  console.log('\n=== Environment Detection ===');
  
  // Check if running in Vercel
  const isVercel = isVercelEnvironment();
  console.log('Is Vercel environment:', isVercel);
  
  // Get detailed environment information
  const envInfo = await getEnvironmentInfo();
  console.log('Environment info:', JSON.stringify(envInfo, null, 2));
}

/**
 * Example 3: Direct implementation access
 */
async function directImplementationAccess() {
  console.log('\n=== Direct Implementation Access ===');
  
  // Get the implementation details
  const implementation = await getFetchImplementation();
  console.log(`Using implementation: ${implementation.name}`);
  
  // You can use the fetch function directly from the implementation
  // This is useful if you need to know which implementation is being used
  console.log('Implementation type:', typeof implementation.fetch);
}

/**
 * Example 4: Different environments simulation
 */
async function simulateEnvironments() {
  console.log('\n=== Environment Simulation ===');
  
  // Current environment
  console.log('Current VERCEL env var:', process.env.VERCEL || 'undefined');
  
  // Simulate Vercel environment
  const originalVercel = process.env.VERCEL;
  process.env.VERCEL = '1';
  
  let implementation = await getFetchImplementation();
  console.log('Simulated Vercel implementation:', implementation.name);
  
  // Reset cache and simulate non-Vercel environment
  const { resetCache } = await import('./src/index');
  resetCache();
  delete process.env.VERCEL;
  
  implementation = await getFetchImplementation();
  console.log('Simulated non-Vercel implementation:', implementation.name);
  
  // Restore original environment
  if (originalVercel !== undefined) {
    process.env.VERCEL = originalVercel;
  }
  resetCache(); // Reset cache to clear any test artifacts
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    await basicUsage();
    await environmentDetection();
    await directImplementationAccess();
    await simulateEnvironments();
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

export {
  basicUsage,
  environmentDetection,
  directImplementationAccess,
  simulateEnvironments,
  runExamples,
};

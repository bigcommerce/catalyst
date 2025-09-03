#!/usr/bin/env tsx

/**
 * Test script to verify OpenTelemetry setup
 * Run with: npx tsx scripts/test-otel.ts
 */

import { trace } from '@opentelemetry/api';
import { withSpan, addSpanAttributes, recordSpanEvent } from '../lib/otel';

async function testOpenTelemetry() {
  console.log('🧪 Testing OpenTelemetry setup...');

  try {
    // Test basic span creation
    await withSpan('test.basic-operation', async (span) => {
      span.setAttributes({
        'test.type': 'basic',
        'test.environment': process.env.NODE_ENV || 'development',
      });

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      recordSpanEvent('work.completed', {
        'work.duration': 100,
        'work.type': 'simulation',
      });

      console.log('✅ Basic span test passed');
    });

    // Test nested spans
    await withSpan('test.nested-operation', async (outerSpan) => {
      outerSpan.setAttributes({
        'test.type': 'nested',
        'test.level': 'outer',
      });

      await withSpan('test.inner-operation', async (innerSpan) => {
        innerSpan.setAttributes({
          'test.level': 'inner',
          'test.dependency': 'outer',
        });

        // Simulate inner work
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('✅ Nested span test passed');
      });
    });

    // Test error handling
    try {
      await withSpan('test.error-operation', async (span) => {
        span.setAttributes({
          'test.type': 'error',
          'test.expected': 'error',
        });

        throw new Error('This is a test error');
      });
    } catch (error) {
      console.log('✅ Error handling test passed');
    }

    // Test attribute addition to active span
    await withSpan('test.attributes', async () => {
      addSpanAttributes({
        'test.attribute1': 'value1',
        'test.attribute2': 42,
        'test.attribute3': true,
      });

      recordSpanEvent('attributes.added', {
        'attributes.count': 3,
      });

      console.log('✅ Attributes test passed');
    });

    console.log('🎉 All OpenTelemetry tests passed!');
    console.log('📊 Check your Lightstep dashboard for traces');

  } catch (error) {
    console.error('❌ OpenTelemetry test failed:', error);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  testOpenTelemetry().catch(console.error);
}

export { testOpenTelemetry };

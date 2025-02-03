// Necessary if using App Router to ensure this file runs on the client
"use client";

import { datadogRum } from "@datadog/browser-rum";

const indexName: string = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '';

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID || '',
  clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || '',
  site: process.env.NEXT_PUBLIC_DATADOG_SITE_HOST as any || 'datadoghq.com',
  service: process.env.NEXT_PUBLIC_DATADOG_SERVICE_NAME || '',
  env: process.env.NEXT_PUBLIC_DATADOG_ENV_NAME || 'prod',
  // Specify a version number to identify the deployed version of your application in Datadog
  // version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: "mask-user-input",
  // Specify URLs to propagate trace headers for connection between RUM and backend trace
  /*
  allowedTracingUrls: [
    { match: "https://example.com/api/", propagatorTypes: ["tracecontext"] },
  ],
  */
});

export function DatadogInit() {
  // Render nothing - this component is only included so that the init code
  // above will run client-side
  return null;
}
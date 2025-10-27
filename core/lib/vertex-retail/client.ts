import { CompletionServiceClient, SearchServiceClient } from '@google-cloud/retail';

interface VertexRetailConfig {
  projectId: string;
  location: string;
  catalog: string;
  placement: string;
  keyFilename?: string;
  credentials?: string;
}

function getConfig(): VertexRetailConfig | null {
  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.VERTEX_RETAIL_LOCATION || 'global';
  const catalog = process.env.VERTEX_RETAIL_CATALOG || 'default_catalog';
  const placement = process.env.VERTEX_RETAIL_PLACEMENT || '';
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credentials = process.env.GCP_SERVICE_ACCOUNT_CREDENTIALS;

  if (!projectId) {
    return null;
  }

  return {
    projectId,
    location,
    catalog,
    placement,
    keyFilename,
    credentials,
  };
}

function getClientOptions(keyFilename?: string, credentialsJson?: string) {
  // Priority 1: Use credentials from environment variable (for Vercel/production)
  if (credentialsJson) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const credentials = JSON.parse(credentialsJson);

      // eslint-disable-next-line no-console
      console.log('[Vertex Client] Using credentials from GCP_SERVICE_ACCOUNT_CREDENTIALS');

      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        credentials,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Vertex Client] Failed to parse GCP_SERVICE_ACCOUNT_CREDENTIALS:', error);
    }
  }

  // Priority 2: Use keyfile path (for local development)
  if (keyFilename) {
    // eslint-disable-next-line no-console
    console.log('[Vertex Client] Using credentials from keyfile:', keyFilename);

    return {
      keyFilename,
    };
  }

  // Priority 3: Use Application Default Credentials (ADC)
  // eslint-disable-next-line no-console
  console.log('[Vertex Client] Using Application Default Credentials (ADC)');

  return {};
}

let completionClient: CompletionServiceClient | null = null;
let searchClient: SearchServiceClient | null = null;

export function getCompletionClient(): CompletionServiceClient | null {
  if (completionClient) {
    return completionClient;
  }

  const config = getConfig();

  if (!config) {
    return null;
  }

  const options = getClientOptions(config.keyFilename, config.credentials);

  completionClient = new CompletionServiceClient(options);

  return completionClient;
}

export function getSearchClient(): SearchServiceClient | null {
  if (searchClient) {
    return searchClient;
  }

  const config = getConfig();

  if (!config) {
    return null;
  }

  const options = getClientOptions(config.keyFilename, config.credentials);

  searchClient = new SearchServiceClient(options);

  return searchClient;
}

export function getCatalogPath(): string | null {
  const config = getConfig();

  if (!config) {
    return null;
  }

  return `projects/${config.projectId}/locations/${config.location}/catalogs/${config.catalog}`;
}

export function getPlacement(): string | null {
  const config = getConfig();

  if (!config) {
    return null;
  }

  // If placement is already a full path (starts with 'projects/'), return as-is
  if (config.placement.startsWith('projects/')) {
    return config.placement;
  }

  // Otherwise, construct the full placement path
  // Format: projects/{project}/locations/{location}/catalogs/{catalog}/servingConfigs/{servingConfig}
  // The serving config is used as the placement for search requests
  const servingConfig = config.placement || 'default_search';

  return `projects/${config.projectId}/locations/${config.location}/catalogs/${config.catalog}/servingConfigs/${servingConfig}`;
}

export function isVertexRetailEnabled(): boolean {
  return process.env.ENABLE_VERTEX_RETAIL_SEARCH === 'true';
}

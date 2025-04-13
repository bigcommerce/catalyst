import { BloomFilter } from 'bloom-filters';
import Sitemapper from 'sitemapper';
import { z } from 'zod';

import { normalizeUrlPath } from '../lib/url-utils';

// Define a type for the expected JSON structure from bloom-filters
interface BloomFilterJSON {
  type: string;
  _capacity: number;
  _errorRate: number;
  _nbHashes: number;
  _filter: {
    _seed: number;
    _length: number;
    _nbHashes: number;
    _buffer: number[];
    _m: number;
    _k: number;
  };
  _seed: number;
}

const sitemapUrlSchema = z.string().url();

// Function to fetch and normalize URLs from sitemap
const fetchAndNormalizeUrls = async (
  sitemapIndexUrl: string,
  trailingSlash: boolean,
): Promise<string[]> => {
  const sitemapper = new Sitemapper({
    url: sitemapIndexUrl,
    timeout: 30000, // 30 seconds timeout for potentially large sitemaps
    requestHeaders: {
      'User-Agent': 'Catalyst-BloomFilter-Generator/1.0',
    },
  });

  try {
    const { sites } = await sitemapper.fetch();

    const urls = sites
      .map((url) => {
        try {
          const parsedUrl = new URL(url);

          // Normalize the pathname part of the URL
          return normalizeUrlPath(parsedUrl.pathname, trailingSlash);
        } catch (e) {
          console.warn(
            `[Bloom Filter] Skipping invalid URL '${url}' from sitemap: ${e instanceof Error ? e.message : String(e)}`,
          );

          return null;
        }
      })
      .filter((url): url is string => url !== null); // Filter out nulls/errors

    // Ensure the root path is included, normalized according to settings
    const rootPath = normalizeUrlPath('/', trailingSlash);

    if (!urls.includes(rootPath)) {
      urls.push(rootPath);
    }

    // Deduplicate URLs after normalization
    const uniqueUrls = [...new Set(urls)];

    return uniqueUrls;
  } catch (error) {
    console.error(`[Bloom Filter] Error fetching sitemap from ${sitemapIndexUrl}:`, error);
    // Re-throw the error to potentially fail the build if sitemap is critical
    throw new Error(`Failed to fetch or process sitemap from ${sitemapIndexUrl}`);
  }
};

// Main function to generate the Bloom filter JSON
export const generateBloomFilterJSON = async (
  trailingSlash: boolean,
): Promise<BloomFilterJSON | null> => {
  const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
  // Default channel ID to '1' if not set, as typical for single-channel stores or default channel
  const channelId = process.env.BIGCOMMERCE_CHANNEL_ID ?? '1';

  if (!storeHash) {
    // If used outside build where env might not be loaded, this check is important
    console.warn(
      '[Bloom Filter] BIGCOMMERCE_STORE_HASH environment variable is not set. Cannot generate sitemap URL.',
    );

    return null; // Cannot proceed without store hash
  }

  // Construct the sitemap URL using HTTPS
  const sitemapIndexUrl = `https://${storeHash}-${channelId}.mybigcommerce.com/xmlsitemap.php`;

  // Validate the generated URL
  if (!sitemapUrlSchema.safeParse(sitemapIndexUrl).success) {
    console.error(
      `[Bloom Filter] Invalid sitemap URL generated: ${sitemapIndexUrl}. Check BIGCOMMERCE_STORE_HASH and BIGCOMMERCE_CHANNEL_ID.`,
    );

    return null; // Cannot proceed with invalid URL
  }

  let urls: string[] = [];

  try {
    urls = await fetchAndNormalizeUrls(sitemapIndexUrl, trailingSlash);
  } catch (error) {
    console.error(
      `[Bloom Filter] Failed to fetch URLs from sitemap: ${error}. Proceeding without Bloom filter.`,
    );

    return null; // Allow build to continue without filter on fetch error
  }

  if (urls.length === 0) {
    console.warn(
      '[Bloom Filter] No valid URLs found after fetching and processing sitemap. Skipping Bloom filter generation.',
    );

    return null; // Return null if no URLs to add
  }

  // Define the desired false positive rate (e.g., 1 in 1000)
  const errorRate = 0.001;

  // Create an optimal Bloom Filter for the items and error rate
  const filter = BloomFilter.from(urls, errorRate);

  // Export the filter to JSON format suitable for storage
  // The .saveAsJSON() method serializes the filter's state.
  const filterJSON: BloomFilterJSON = filter.saveAsJSON() as BloomFilterJSON;

  return filterJSON;
};

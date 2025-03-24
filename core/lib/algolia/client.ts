import { algoliasearch } from 'algoliasearch';

if (!process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_APPLICATION_ID is required');
}

if (!process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY is not set');
}

const algoliaClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APPLICATION_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
);

export default algoliaClient;

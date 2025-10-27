import type { google } from '@google-cloud/retail/build/protos/protos';

export type CompleteQueryResponse = google.cloud.retail.v2.ICompleteQueryResponse;

export type CompletionResult = google.cloud.retail.v2.CompleteQueryResponse.ICompletionResult;

export type SearchResponse = google.cloud.retail.v2.ISearchResponse;

export type SearchResult = google.cloud.retail.v2.SearchResponse.ISearchResult;

export type Product = google.cloud.retail.v2.IProduct;

export interface VertexProductSuggestion {
  productId: string;
  suggestion: string;
  attributes?: Record<string, unknown>;
}

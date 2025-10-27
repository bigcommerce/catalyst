/**
 * Transform Vertex AI facets to Catalyst UI facet format
 */

import type { Filter } from '@/vibes/soul/sections/products-list-section/filters-panel';

interface VertexFacetValue {
  value: string;
  count: string;
  minValue?: number;
  maxValue?: number;
}

interface VertexFacet {
  key: string;
  values?: VertexFacetValue[];
  dynamicFacet: boolean;
}

/**
 * Detect if a facet should be rendered as a range filter based on its values
 */
function shouldBeRangeFilter(facet: VertexFacet): boolean {
  // If any value has min/max, it's a range facet
  if (facet.values?.some((v) => v.minValue !== undefined || v.maxValue !== undefined)) {
    return true;
  }

  // Check if all values are numeric strings
  const allNumeric = facet.values?.every((v) => !isNaN(Number(v.value))) ?? false;

  if (allNumeric && facet.values && facet.values.length > 2) {
    return true;
  }

  return false;
}

/**
 * Get a human-readable label from a facet key
 */
function getFacetLabel(key: string): string {
  // Handle common facet keys
  const labelMap: Record<string, string> = {
    brands: 'Brand',
    categories: 'Category',
    colorFamilies: 'Color',
    sizes: 'Size',
    materials: 'Material',
    patterns: 'Pattern',
    'priceInfo.price': 'Price',
    'attributes.sizes': 'Size',
    'attributes.materials': 'Material',
    'attributes.patterns': 'Pattern',
  };

  if (labelMap[key]) {
    return labelMap[key];
  }

  // Generic label from camelCase or dot notation
  const withoutPrefix = key.replace(/^attributes\./, '');

  return withoutPrefix
    .split(/[._]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get a URL-friendly param name from a facet key
 */
function getParamName(key: string): string {
  // Handle common facet keys
  const paramMap: Record<string, string> = {
    brands: 'brand',
    categories: 'category',
    colorFamilies: 'color',
    sizes: 'size',
    materials: 'material',
    patterns: 'pattern',
    'attributes.sizes': 'size',
    'attributes.materials': 'material',
    'attributes.patterns': 'pattern',
  };

  if (paramMap[key]) {
    return paramMap[key];
  }

  // Generic param name
  return key
    .replace(/^attributes\./, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
}

/**
 * Transform Vertex facets to UI-compatible facet format
 * @param {VertexFacet[]} vertexFacets - Array of facets from Vertex AI Search API
 * @returns {Filter[]} Array of UI-compatible facet objects
 */
export function transformVertexFacets(vertexFacets: VertexFacet[]): Filter[] {
  return vertexFacets
    .map((facet): Filter | null => {
      // Skip empty facets
      if (!facet.values?.length) {
        return null;
      }

      // Transform price range facet (if we have min/max values)
      if (facet.key === 'priceInfo.price' || shouldBeRangeFilter(facet)) {
        // Find the overall min and max from the intervals or values
        const prices = facet.values
          .filter((v) => v.minValue !== undefined || v.maxValue !== undefined)
          .flatMap((v) => [v.minValue, v.maxValue])
          .filter((p): p is number => p !== undefined);

        // Fallback to parsing values as numbers if no min/max
        if (prices.length === 0) {
          const numericValues = facet.values
            .map((v) => Number(v.value))
            .filter((n) => !isNaN(n));

          if (numericValues.length > 0) {
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);

            return {
              type: 'range',
              minParamName: `min_${getParamName(facet.key)}`,
              maxParamName: `max_${getParamName(facet.key)}`,
              label: getFacetLabel(facet.key),
              min,
              max,
            };
          }
        } else {
          return {
            type: 'range',
            minParamName: facet.key === 'priceInfo.price' ? 'minPrice' : `min_${getParamName(facet.key)}`,
            maxParamName: facet.key === 'priceInfo.price' ? 'maxPrice' : `max_${getParamName(facet.key)}`,
            label: getFacetLabel(facet.key),
            min: Math.min(...prices),
            max: Math.max(...prices),
          };
        }

        return null;
      }

      // Transform categories facet
      // Categories come as hierarchical strings: "Parent > Child"
      if (facet.key === 'categories') {
        return {
          type: 'toggle-group',
          paramName: getParamName(facet.key),
          label: getFacetLabel(facet.key),
          options: facet.values
            .map((value) => {
              // Extract the last part of the category path for display
              const parts = value.value.split(' > ');
              const displayName = parts[parts.length - 1] || value.value;

              return {
                label: `${displayName} (${value.count})`,
                value: value.value, // Keep full path as value for filtering
              };
            })
            // Sort by count (most popular first)
            .sort((a, b) => {
              const countRegex = /\((\d+)\)/;
              const matchA = countRegex.exec(a.label);
              const matchB = countRegex.exec(b.label);
              const countA = parseInt(matchA?.[1] ?? '0', 10);
              const countB = parseInt(matchB?.[1] ?? '0', 10);

              return countB - countA;
            })
            // Limit to top 20 to avoid overwhelming UI
            .slice(0, 20),
        };
      }

      // For all other facet types (brands, colors, sizes, materials, patterns, etc.)
      // create a toggle group with smart labeling
      return {
        type: 'toggle-group',
        paramName: getParamName(facet.key),
        label: getFacetLabel(facet.key),
        options: facet.values
          .map((value) => ({
            label: `${value.value} (${value.count})`,
            value: value.value,
          }))
          // Sort by count (most popular first) for better UX
          .sort((a, b) => {
            const countRegex = /\((\d+)\)/;
            const matchA = countRegex.exec(a.label);
            const matchB = countRegex.exec(b.label);
            const countA = parseInt(matchA?.[1] ?? '0', 10);
            const countB = parseInt(matchB?.[1] ?? '0', 10);

            return countB - countA;
          })
          // Limit to reasonable number to avoid overwhelming UI
          .slice(0, 30),
      };
    })
    .filter((facet): facet is Filter => facet !== null);
}

import axios from 'axios';
import { cache } from 'react';

interface GetBrandsRestResponse {
  status: 'success' | 'error';
  brands?: {
    id: number;
    name: string;
    image_url?: string;
    custom_url?: { url: string };
  }[];
  error?: string;
  meta?: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
      links: {
        previous?: string;
        current: string;
        next?: string;
      };
    };
  };
}

export const getBrandsRest = cache(
  async ({ page = 1, limit = 20 } = {}): Promise<GetBrandsRestResponse> => {
    try {
      const response = await axios.get(
        `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/catalog/brands`,
        {
          params: {
            page,
            limit,
            sort: 'name',
          },
          headers: {
            'X-Auth-Token': process.env.BIGCOMMERCE_API_ACCESS_TOKEN ?? '',
            'Content-Type': 'application/json',
          },
        },
      );
      const { data, meta } = response.data;
      return { status: 'success', brands: data, meta };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { status: 'error', error: error.message };
      }
      return { status: 'error', error: 'Something went wrong. Please try again.' };
    }
  },
);

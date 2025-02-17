// wishlist-page.tsx

import { getSessionUserDetails } from '~/auth';
import { WishlistProductCard } from './wishlist-products-card';
import { GetCustomerGroupById } from '~/components/management-apis';
import { cookies } from 'next/headers';
import { getPriceMaxRules } from '~/belami/lib/fetch-price-max-rules';

interface CustomerGroup {
  discount_rules: Array<{
    amount: string;
    type: string;
    category_id: string;
    product_id: string;
    method: string;
  }>;
}

async function getPageData() {
  try {
    // Fix: Await the cookies() call
    const cookieStore = await cookies();
    const priceMaxCookie = cookieStore.get('pmx');

    let priceMaxRules = null;

    if (priceMaxCookie?.value) {
      try {
        const priceMaxTriggers = JSON.parse(atob(priceMaxCookie.value));
        if (Object.values(priceMaxTriggers).length > 0) {
          priceMaxRules = await getPriceMaxRules(priceMaxTriggers);
          console.log('Price Max Rules loaded:', priceMaxRules);
        }
      } catch (parseError) {
        console.error('Error parsing price max cookie:', parseError);
      }
    }

    const sessionUser = await getSessionUserDetails();
    let customerGroupDetails: CustomerGroup = {
      discount_rules: [],
    };

    if (sessionUser) {
      const customerGroupId = sessionUser?.customerGroupId;
      customerGroupDetails = await GetCustomerGroupById(customerGroupId);
    }

    return {
      priceMaxRules,
      customerGroupDetails,
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return {
      priceMaxRules: null,
      customerGroupDetails: { discount_rules: [] },
    };
  }
}

export default async function WishlistPage() {
  const { priceMaxRules, customerGroupDetails } = await getPageData();

  return (
    <WishlistProductCard
      customerGroupDetails={customerGroupDetails}
      priceMaxRules={priceMaxRules}
    />
  );
}

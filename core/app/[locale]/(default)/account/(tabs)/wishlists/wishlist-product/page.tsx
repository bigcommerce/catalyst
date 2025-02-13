import { getSessionUserDetails } from '~/auth';
import { WishlistProductCard } from './wishlist-products-card';
import { GetCustomerGroupById } from '~/components/management-apis';

interface CustomerGroup {
  discount_rules: Array<{
    amount: string;
    type: string;
    category_id: string;
    product_id: string;
    method: string;
  }>;
}

const sessionUser = await getSessionUserDetails();
let customerGroupDetails: CustomerGroup = {
  discount_rules: [],
};
if (sessionUser) {
  const customerGroupId = sessionUser?.customerGroupId;
  customerGroupDetails = await GetCustomerGroupById(customerGroupId);
}

export default async function WishlistPage() {
  return <WishlistProductCard customerGroupDetails={customerGroupDetails} />;
}

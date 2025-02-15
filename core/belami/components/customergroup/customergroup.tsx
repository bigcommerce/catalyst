'use server';

import { getSessionUserDetails } from "~/auth";
import { GetCustomerGroupById } from "~/components/management-apis";
  
interface DiscountRule {
  amount: string;
  type: string;
  category_id: string;
  product_id: string;
  method: string;
}

interface CustomerGroup {
  discount_rules: DiscountRule[];
}

export const CustomerGroupServer = async (): Promise<CustomerGroup> => {
  let customerGroupDetails: CustomerGroup = { discount_rules: [] };

  const sessionUser = await getSessionUserDetails();
  if (sessionUser) {
    const customerGroupId = sessionUser?.customerGroupId;
    customerGroupDetails = await GetCustomerGroupById(customerGroupId);
  }

  return customerGroupDetails;
};
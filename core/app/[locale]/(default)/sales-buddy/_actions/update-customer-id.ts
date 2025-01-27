'use server';

import { cookies } from 'next/headers';

export const UpdateCustomerId = async (CustomerID: any, OrderId: any) => {
  try {
    // Prepare the payload data
    const postData = JSON.stringify({
      customer_id: CustomerID,
      order_id: OrderId,
      access_id: process.env.SALES_BUDDY_ACCESS_ID,
    });

    // Build the API URL
    const apiUrl = process.env.SALES_BUDDY_API_URL;
    const apiEnv = process.env.SALES_BUDDY_API_ENV;
    const apiPath = process.env.SALES_BUDDY_API_PATH;
    const endpoint = `${apiUrl}${apiEnv}${apiPath}update-customer-id`;

    // Perform the fetch request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    });
    // Parse the JSON response (if needed)
    const responseData = await response.json();
    return responseData.output; // Return the data to the caller
  } catch (error) {
    console.error('Error updating customer ID:', error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
};
export const setCustomerIdViaSessionId = async (id: any) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'customer_id_for_agent',
    value: id,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });
};

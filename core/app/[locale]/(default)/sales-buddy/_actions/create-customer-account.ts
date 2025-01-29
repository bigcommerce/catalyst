'use server';

export const createCustomerAccount = async (payload: {
  first_name: string;
  last_name: string;
  company?: string;
  email: string;
  phone?: string;
  referral_id?: string;
}) => {
  try {
    const { first_name, last_name, email, referral_id } = payload;

    const postData = JSON.stringify({
      email,
      first_name,
      last_name,
      referral_id: referral_id || '',
      access_id: process.env.SALES_BUDDY_ACCESS_ID,
    });

    const URL = `${process.env.SALES_BUDDY_API_URL}${process.env.SALES_BUDDY_API_ENV}${process.env.SALES_BUDDY_API_PATH}create-customer`;

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: response.status,
        error: errorText || 'Failed to create customer account',
      };
    }

    const responseData = await response.json();

    return {
      status: 200,
      data: responseData,
    };
  } catch (error) {
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
};
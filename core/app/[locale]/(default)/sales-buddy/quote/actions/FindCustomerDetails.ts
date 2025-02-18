'use server';

export const findCustomerDetails = async (payload: {
  first_name: string;
  last_name: string;
  company?: string;
  email: string;
  phone?: string;
  referrerId?: string;
}) => {
  try {
    const { first_name, last_name, company, email, phone, referrerId } = payload;
    const fullname=first_name
    const postData = JSON.stringify({
      email: email,
      full_name: fullname,
      company: company, // Optional field
      phone: phone, // Optional field
      access_id: process.env.SALES_BUDDY_ACCESS_ID, // Required field
    });

    // Prepare API URL
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    
    const fullApiUrl = `${apiUrl}${apiEnv}${apiPath}find-customer`;
    console.log('findCustomer Api-----------------', fullApiUrl);

    // Make the API call
    const response = await fetch(fullApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    });

    // Check for response status and parse response JSON
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create account');
    }

    const data = await response.json();
    return { status: 200, data };
  } catch (error: any) {
    console.error('Error in createCustomerAccount:', error);
    return { status: 500, error: error.message || 'An unknown error occurred' };
  }
};

'use server';

export const createCustomerAccount = async (payload: {
  // fullname: string;
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  referralId: string;
}) => {
  try {
    console.log('createCustomerAccount called4');

    const { first_name, last_name, company, email, phone, referralId } = payload;
    const postData = JSON.stringify({
      email: email,
      first_name: first_name, // Assuming first name is the first part of fullname
      last_name: last_name, // Assuming last name is the rest of the fullname
      referral_id:referralId,
      access_id: process.env.SALES_BUDDY_ACCESS_ID,
    });

    console.log('Postdata----', postData);

    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    const URL = `${apiUrl}${apiEnv}${apiPath}create-customer`;
    let data = await fetch(URL, {
      method: 'POST', // Assuming you want to create a customer, use POST
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    })
      .then((res) => {
        res.json();
      })
      .then((jsonData) => {
        console.log(jsonData);
      })
      .catch((error) => {
               return { status: 500, error: error.message };
      });

    return { status: 200, data: data };
  } catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};

'use server';

export const createCustomerAccount = async (payload: {
  fullname: string;
  company: string;
  email: string;
  phone: string;
  referrerId: string;
}) => {
  try {
    console.log('createCustomerAccount called4');

    const { fullname, company, email, phone, referrerId } = payload;
    const postData = JSON.stringify({
      email: email,
      first_name: fullname.split(' ')[0], // Assuming first name is the first part of fullname
      last_name: fullname.split(' ').slice(1).join(' '), // Assuming last name is the rest of the fullname
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
      });

    return data;
  } catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};

// export async function getCustomerByEmail(email: string) {
//   if (!process.env.ACCESS_TOKEN) {
//     throw new Error('ACCESS_TOKEN is not set');
//   }
//
//   if (!process.env.STORE_HASH) {
//     throw new Error('STORE_HASH is not set');
//   }
//
//   const encodedEmail = encodeURIComponent(email);
//
//   const response = await fetch(
//     `https://api.company.com/stores/${process.env.STORE_HASH}/v3/customers?email:in=${encodedEmail}`,
//     {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Auth-Token': process.env.ACCESS_TOKEN,
//       },
//     },
//   );
//
//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`API request failed with status ${response.status}: ${errorText}`);
//   }
//
//   const data: unknown = await response.json();
//   const parsedResponse = CustomersResponse.parse(data);
//   const customers = parsedResponse.data;
//
//   if (customers.length === 0) {
//     throw new Error(`Customer with email ${email} not found`);
//   }
//
//   const customer = Customer.parse(customers[0]);
//
//   return {
//     id: customer.id,
//     firstName: customer.first_name,
//     lastName: customer.last_name,
//     email: customer.email,
//     // Include other fields as needed
//   };
// }

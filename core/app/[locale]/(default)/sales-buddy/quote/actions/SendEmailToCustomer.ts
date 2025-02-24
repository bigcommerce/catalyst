'use server';

export const sendEmailToCustomer = async (dataToSend:any) => {
    try {

        const { quote_id, bc_customer_id, quote_type, qr_customer, qr_product,cart_url,page_type } = dataToSend; 

        const apiUrl = process.env.SALES_BUDDY_API_URL!;
        const apiPath = process.env.QUOTE_API_PATH!;
        const apiEnv = process.env.SALES_BUDDY_API_ENV!;
       const accessId = process.env.QUOTE_ACCESS_ID;
       const bc_channel_id = process.env.BIGCOMMERCE_CHANNEL_ID;

    const email_template_type = quote_type === "New" || "old" ? "new_quote_template" : "old_quote_template";

       let postData = JSON.stringify({
        store: 1,
        email_template_type: email_template_type,
        quote_id: quote_id,
        bc_channel_id: bc_channel_id,
        bc_customer_id: bc_customer_id,
        qr_customer:qr_customer,
        qr_product: qr_product,
        quote_type:quote_type,
    });
    console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{dataEmail",postData);
// `${apiUrl}${apiEnv}${apiPath}send-mail`


      const response = await fetch(`https://tukf5296i6.execute-api.us-east-1.amazonaws.com/dev/quote-api/v1/send-mail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postData,
      });
  
      const result = await response.json();
      if (response.ok) {
        return result;
      } else {
        throw new Error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };
  
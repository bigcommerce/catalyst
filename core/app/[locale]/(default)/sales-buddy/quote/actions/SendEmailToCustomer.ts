'use server';

export const sendEmailToCustomer = async (dataToSend:any) => {
    try {

        const { quote_id, bc_customer_id, quote_type, qr_customer, qr_product} = dataToSend; 

        const apiUrl = process.env.SALES_BUDDY_API_URL!;
        const apiPath = process.env.QUOTE_API_PATH!;
        const apiEnv = process.env.SALES_BUDDY_API_ENV!;
       const accessId = process.env.QUOTE_ACCESS_ID;
       const bc_channel_id = process.env.BIGCOMMERCE_CHANNEL_ID;

        const email_template_type = quote_type === "New" ? "create_quote_template":quote_type === "old" ? "existing_quote_template" : quote_type == "" ? "agent_approval_template" : "old_quote_template";

       let postData = JSON.stringify({
        store: 1,
        email_template_type: email_template_type,
        quote_id: quote_id,
        bc_channel_id: bc_channel_id,
        bc_customer_id: bc_customer_id,
        qr_customer:qr_customer,
        qr_product: qr_product,
        quote_type:quote_type
    });


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
  
'use server';

export const storeFileInS3Bucket = async (dataToSend: any) => {
  try {

    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiPath = process.env.QUOTE_API_PATH!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const accessId = process.env.QUOTE_ACCESS_ID;
    const bc_channel_id = process.env.BIGCOMMERCE_CHANNEL_ID;
    const formData = new FormData();
    formData.append('attachment_file', dataToSend);
    formData.append('file_type', dataToSend.type); 
    const response = await fetch(
      `https://tukf5296i6.execute-api.us-east-1.amazonaws.com/dev/quote-api/v1/add-upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to send email');
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

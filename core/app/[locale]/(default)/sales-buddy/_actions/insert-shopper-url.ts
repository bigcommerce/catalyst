// handlerUpdateSessionUrl;

'use server';

export const InsertShopperVisitedUrl = async (sessionId: any, url: string) => {
  try {
    let postData = JSON.stringify({
      session_id: sessionId,
      url: url,
      access_id: process.env.SALES_BUDDY_ACCESS_ID,
    });

    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    let data = await fetch(apiUrl + apiEnv + apiPath + 'update-session-url', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: postData,
    })
      .then((res) => res.json())
      .then((jsonData) => {
        return jsonData;
      })
      .catch((error) => {
        return { status: 500, error: error.message };
      });
    return data;
  } catch (error) {
    return { status: 500, error: JSON.stringify(error) };
  }
};

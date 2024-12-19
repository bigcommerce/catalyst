'use server';
export const getBrand = async () => {

  try {
  
    const apiUrl = process.env.SALES_BUDDY_API_URL!;
    const apiEnv = process.env.SALES_BUDDY_API_ENV!;
    const apiPath = process.env.SALES_BUDDY_API_PATH!;
    const accessId = process.env.SALES_BUDDY_ACCESS_ID;

    let postData = JSON.stringify({
      "access_id": accessId
    });
    
    let data = await fetch(
      `${apiUrl}${apiEnv}${apiPath}get-brands`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postData,
      },
    ).then(res => res.json())
      .then(jsonData => {
        return jsonData;
      }).catch((error) => {
        return ({ status: 500, error: error.message });
      });
    return data;
  } catch (error) {
    return ({ status: 500, error: JSON.stringify(error) });
  }
}


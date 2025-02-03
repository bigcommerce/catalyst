export const getPriceMaxRules = async (
    triggers: {
      d?: string,
      source?: string
    }
  ) => {
    const response = await fetch(`https://bc-api-integrations.vercel.app/api/get-price-max`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        activation_code: triggers.d || triggers.source,
      }),
      cache: 'force-cache',
      next: { revalidate: 3600 }
    });
  
    const data = await response.json();
  
    return data?.status == 200 && !!data?.output ? data?.output : null;
  };
export async function POST(request: Request) {
  if (!process.env.KLAVIYO_PROFILE_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing Klaviyo API key' }), { status: 500 });
  }

  const formData = await request.formData();

  const email = formData.get('email');

  if (!email) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const url = 'https://a.klaviyo.com/api/profiles';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/vnd.api+json',
      revision: '2025-01-15',
      'content-type': 'application/vnd.api+json',
      Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PROFILE_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: 'profile',
        attributes: {
          properties: {},
          email,
        },
      },
    }),
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return new Response(JSON.stringify({ email }), { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);

    return new Response(JSON.stringify({ error: 'Failed to create profile' }), { status: 500 });
  }
}

export const GET = async () => {
  const response = await fetch('https://worried-watch-rogers-retain.trycloudflare.com/', {
    next: { revalidate: 30 },
  });

  const text = await response.text();

  return new Response(text, {
    headers: {
      'content-type': 'text/plain',
    },
  });
};

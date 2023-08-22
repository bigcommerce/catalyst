export const GET = async () => {
  const response = await fetch('https://brings-nashville-pontiac-mention.trycloudflare.com/', {
    next: { revalidate: 30 },
  });

  const time = await response.text();

  return new Response(time);
};

export const runtime = 'edge';

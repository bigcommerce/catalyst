import type { MetadataRoute } from 'next';

function parseUrl(url?: string): URL {
  let incomingUrl = '';
  const defaultUrl = new URL('http://localhost:3000/');

  if (url && !url.startsWith('http')) {
    incomingUrl = `https://${url}`;
  }

  return new URL(incomingUrl || defaultUrl);
}

// Disallow routes that have no SEO value or should not be indexed
const disallow = ['/cart', '/account'];

// Robots.txt config https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots#generate-a-robots-file
export default function robots(): MetadataRoute.Robots {
  return {
    // Infer base URL from environment variables
    sitemap: parseUrl(process.env.NEXTAUTH_URL || process.env.VERCEL_URL || '').origin,
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow,
      },
    ],
  };
}

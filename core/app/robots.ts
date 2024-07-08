import type { MetadataRoute } from 'next';

// Disallow routes that have no SEO value or should not be indexed
const disallow = ['/cart', '/account'];

// Robots.txt config https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots#generate-a-robots-file
const robotsConfig: MetadataRoute.Robots = {
  rules: [
    {
      userAgent: '*',
      allow: ['/'],
      disallow,
    },
  ],
};

// Infer base URL from environment variables
const baseUrl = process.env.PRODUCTION_BASE_URL || process.env.NEXTAUTH_URL;

// Set sitemap URL if base URL is defined, as sitemap URL must be an absolute URL
if (baseUrl) {
  robotsConfig.sitemap = `${baseUrl}/sitemap.xml`;
}

export default function robots(): MetadataRoute.Robots {
  return robotsConfig;
}

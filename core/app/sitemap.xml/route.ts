import { NextRequest } from 'next/server';

/*
 * Using `/xmlsitemap.php` to have backwards compatibility with existing BigCommerce sitemaps
 * which may already be indexed by search engines or configured in Webmaster Tools.
 * 
 * You may move this file to any route you wish, but make sure to update this URL accordingly
 * to ensure URLs are generated correctly.
 * 
 * You should also update middleware.ts to ensure that the sitemap is served correctly.
 */
const sitemapIndexUrl = '/xmlsitemap.php';

const storeHash = process.env.BIGCOMMERCE_STORE_HASH;
const channelId = process.env.BIGCOMMERCE_CHANNEL_ID;
const canonicalDomain = 'mybigsitemap.site';

const remoteSitemapBaseUrl = `https://store-${storeHash}${Number(channelId) > 1 ? `-${channelId}` : ''}.${canonicalDomain}/xmlsitemap.php`;

function getFirstLocDomain(xmlString: string) {
  // Use a regular expression to match the first <loc> tag and its content
  const locTagMatch = xmlString.match(/<loc>(.*?)<\/loc>/);

  // If a match is found, extract the content of the first <loc> tag
  if (locTagMatch && locTagMatch[1]) {
    const locContent = locTagMatch[1];

    // Use a regular expression to extract the domain name from the URL
    const domainMatch = locContent.match(/https?:\/\/([^\/]+)/);

    // If a domain match is found, return the domain name
    if (domainMatch && domainMatch[1]) {
      return domainMatch[1];
    } else {
      return null; // No domain name found in the URL
    }
  } else {
    return null; // No <loc> tag found
  }
}

function replaceDomainAndPathInXml(xmlString: string, oldDomain: string, newDomain: string) {
  // Create a new XML string with updated domain and root route
  return xmlString.replace(/<loc>(.*?)<\/loc>/g, (match: any, p1: string | URL) => {
    try {
      const url = new URL(p1);
      if (url.hostname === oldDomain) {
        url.hostname = newDomain;
        url.pathname = sitemapIndexUrl;
      }
      return `<loc>${url.toString()}</loc>`;
    } catch (error) {
      return match;
    }
  });
}

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const url = new URL(remoteSitemapBaseUrl);

  url.search = searchParams.toString();

  try {
    // Fetch the XML document
    const response = await fetch(url.toString(), {
      next: {
        revalidate: 3600, // 1 hour
      },
    });
    const xml = await response.text();
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    return new Response('Error fetching or modifying the XML document', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
};

export const runtime = 'edge';

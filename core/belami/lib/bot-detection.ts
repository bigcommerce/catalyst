'use server';

const BAD_UA_KEYWORDS = ["bot", "agent", "crawl", "spider", "slurp", "rpt-httpclient", "msnptc", "ktxn", "netcraft", "postman", "curl", "python", "go-http-client", "java", "okhttp", "node-fetch", "axios", "http-client", "httpurlconnection", "okhttp", "vercel", "iframely", "alittle", "scrapy", "dummy", "censys", "researchscan"];

export async function isBadUserAgent(ua: string) {
  return ua.length > 0 && BAD_UA_KEYWORDS.some(keyword => ua.toLowerCase().includes(keyword));
}
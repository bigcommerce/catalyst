// Click IDs and campaign tags that marketing tools append to links. They never
// affect which entity a URL resolves to, but each unique value would otherwise
// be its own route cache entry and a blocking route lookup.
const TRACKING_PARAMS = new Set([
  '_branch_match_id',
  '_ga',
  '_gl',
  '_hsenc',
  '_hsmi',
  '_kx',
  'dclid',
  'epik',
  'fbclid',
  'gad_campaignid',
  'gad_source',
  'gbraid',
  'gclid',
  'gclsrc',
  'igshid',
  'irclickid',
  'li_fat_id',
  'mc_cid',
  'mc_eid',
  'mkt_tok',
  'msclkid',
  'rdt_cid',
  'sccid',
  'srsltid',
  'ttclid',
  'twclid',
  'wbraid',
  'yclid',
]);

const decodeKey = (key: string) => {
  try {
    return decodeURIComponent(key.replace(/\+/g, ' '));
  } catch {
    return key;
  }
};

const isTrackingParam = (key: string) => {
  const name = decodeKey(key).toLowerCase();

  return name.startsWith('utm_') || TRACKING_PARAMS.has(name);
};

const toSearch = (segments: string[]) => (segments.length > 0 ? `?${segments.join('&')}` : '');

// Splits a query string into the part used for route resolution and the
// tracking params removed from it. Order is kept because BigCommerce matches
// redirect sources against the query as written. Segments are not re-encoded.
export function splitRouteLookupSearch(search: string): { lookup: string; tracking: string } {
  const query = search.startsWith('?') ? search.slice(1) : search;
  const lookup: string[] = [];
  const tracking: string[] = [];

  query
    .split('&')
    .filter((segment) => segment.length > 0)
    .forEach((segment) => {
      const key = segment.split('=', 1)[0] ?? '';

      (isTrackingParam(key) ? tracking : lookup).push(segment);
    });

  return { lookup: toSearch(lookup), tracking: toSearch(tracking) };
}

// BigCommerce redirects can match on specific query params; those are consumed
// by the redirect, so only the tracking params are carried over in that case.
export function getRedirectSearch(fromPathSearch: string, requestSearch: string): string {
  return fromPathSearch.length > 0 ? splitRouteLookupSearch(requestSearch).tracking : requestSearch;
}

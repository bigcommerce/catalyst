// Never affect route resolution, but each unique value would be its own cache entry.
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

// Keeps the original order, since BigCommerce matches redirect queries as written.
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

// Params matched by the redirect are consumed; only tracking params carry over.
export function getRedirectSearch(fromPathSearch: string, requestSearch: string): string {
  return fromPathSearch.length > 0 ? splitRouteLookupSearch(requestSearch).tracking : requestSearch;
}

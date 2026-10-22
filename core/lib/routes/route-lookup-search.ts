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

// Normalizes a query string for route resolution: drops tracking params and
// sorts the rest by key, so URLs that only differ in those share one lookup.
// Segments are kept as-is (not re-encoded) and the relative order of repeated
// keys is preserved.
export function normalizeRouteLookupSearch(search: string): string {
  const query = search.startsWith('?') ? search.slice(1) : search;

  const params = query
    .split('&')
    .filter((segment) => segment.length > 0)
    .map((segment) => ({ segment, key: segment.split('=', 1)[0] ?? '' }))
    .filter(({ key }) => !isTrackingParam(key))
    .sort((a, b) => {
      if (a.key === b.key) {
        return 0;
      }

      return a.key < b.key ? -1 : 1;
    })
    .map(({ segment }) => segment);

  return params.length > 0 ? `?${params.join('&')}` : '';
}

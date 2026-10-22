import { describe, expect, it } from 'vitest';

import { getRedirectSearch, splitRouteLookupSearch } from './route-lookup-search';

describe('splitRouteLookupSearch', () => {
  it('returns empty strings for an empty query', () => {
    expect(splitRouteLookupSearch('')).toEqual({ lookup: '', tracking: '' });
    expect(splitRouteLookupSearch('?')).toEqual({ lookup: '', tracking: '' });
  });

  it('moves utm_* params out of the lookup', () => {
    expect(splitRouteLookupSearch('?utm_source=google&utm_medium=cpc')).toEqual({
      lookup: '',
      tracking: '?utm_source=google&utm_medium=cpc',
    });
  });

  it('moves known click IDs and campaign tags out of the lookup', () => {
    const { lookup } = splitRouteLookupSearch(
      '?gclid=1&gbraid=2&wbraid=3&dclid=4&fbclid=5&msclkid=6&ttclid=7&twclid=8&li_fat_id=9&mc_cid=10&mc_eid=11&_ga=12&_gl=13&igshid=14&yclid=15&srsltid=16',
    );

    expect(lookup).toBe('');
  });

  it('matches tracking params case-insensitively and when encoded', () => {
    expect(splitRouteLookupSearch('?UTM_Source=a&GCLID=b&%5Fga=c').lookup).toBe('');
  });

  it('keeps other params in the lookup', () => {
    expect(splitRouteLookupSearch('?page=2&utm_source=google')).toEqual({
      lookup: '?page=2',
      tracking: '?utm_source=google',
    });
  });

  it('does not treat params that only share a prefix as tracking', () => {
    expect(splitRouteLookupSearch('?utm=1&gclid_extra=2').lookup).toBe('?utm=1&gclid_extra=2');
  });

  it('preserves the original order of the remaining params', () => {
    expect(splitRouteLookupSearch('?z=1&utm_source=x&a=2&z=3').lookup).toBe('?z=1&a=2&z=3');
  });

  it('keeps segments as-is without re-encoding', () => {
    expect(splitRouteLookupSearch('?q=a%20b&flag&x=y+z').lookup).toBe('?q=a%20b&flag&x=y+z');
  });

  it('ignores empty segments', () => {
    expect(splitRouteLookupSearch('?&a=1&&b=2&').lookup).toBe('?a=1&b=2');
  });

  it('accepts a query without the leading question mark', () => {
    expect(splitRouteLookupSearch('a=1&fbclid=2')).toEqual({
      lookup: '?a=1',
      tracking: '?fbclid=2',
    });
  });

  it('gives URLs that differ only in tracking params the same lookup', () => {
    const a = splitRouteLookupSearch('?id=5&utm_source=newsletter&fbclid=abc').lookup;
    const b = splitRouteLookupSearch('?gclid=xyz&id=5&utm_source=ads').lookup;

    expect(a).toBe('?id=5');
    expect(b).toBe(a);
  });
});

describe('getRedirectSearch', () => {
  it('carries the full query when the redirect source has no query', () => {
    expect(getRedirectSearch('', '?id=5&utm_source=x')).toBe('?id=5&utm_source=x');
  });

  it('carries only tracking params when the redirect source matched on the query', () => {
    expect(getRedirectSearch('?id=5', '?id=5&utm_source=newsletter&gclid=123')).toBe(
      '?utm_source=newsletter&gclid=123',
    );
  });

  it('carries nothing when a query-matched request has no tracking params', () => {
    expect(getRedirectSearch('?id=5', '?id=5')).toBe('');
  });
});

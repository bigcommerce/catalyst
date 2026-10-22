import { describe, expect, it } from 'vitest';

import { normalizeRouteLookupSearch } from './route-lookup-search';

describe('normalizeRouteLookupSearch', () => {
  it('returns an empty string for an empty query', () => {
    expect(normalizeRouteLookupSearch('')).toBe('');
    expect(normalizeRouteLookupSearch('?')).toBe('');
  });

  it('drops utm_* params', () => {
    expect(normalizeRouteLookupSearch('?utm_source=google&utm_medium=cpc&utm_campaign=x')).toBe('');
  });

  it('drops known click IDs and campaign tags', () => {
    expect(
      normalizeRouteLookupSearch(
        '?gclid=1&gbraid=2&wbraid=3&dclid=4&fbclid=5&msclkid=6&ttclid=7&twclid=8&li_fat_id=9&mc_cid=10&mc_eid=11&_ga=12&_gl=13&igshid=14&yclid=15&srsltid=16',
      ),
    ).toBe('');
  });

  it('matches tracking params case-insensitively and when encoded', () => {
    expect(normalizeRouteLookupSearch('?UTM_Source=a&GCLID=b&%5Fga=c')).toBe('');
  });

  it('keeps other params', () => {
    expect(normalizeRouteLookupSearch('?page=2&utm_source=google')).toBe('?page=2');
  });

  it('does not treat params that only share a prefix as tracking', () => {
    expect(normalizeRouteLookupSearch('?utm=1&gclid_extra=2')).toBe('?gclid_extra=2&utm=1');
  });

  it('sorts the remaining params by key', () => {
    expect(normalizeRouteLookupSearch('?sort=price&brand=1&page=2')).toBe(
      '?brand=1&page=2&sort=price',
    );
  });

  it('preserves the order of repeated keys', () => {
    expect(normalizeRouteLookupSearch('?size=l&color=red&size=m')).toBe('?color=red&size=l&size=m');
  });

  it('keeps segments as-is without re-encoding', () => {
    expect(normalizeRouteLookupSearch('?q=a%20b&flag&x=y+z')).toBe('?flag&q=a%20b&x=y+z');
  });

  it('ignores empty segments', () => {
    expect(normalizeRouteLookupSearch('?&a=1&&b=2&')).toBe('?a=1&b=2');
  });

  it('accepts a query without the leading question mark', () => {
    expect(normalizeRouteLookupSearch('b=2&a=1')).toBe('?a=1&b=2');
  });

  it('gives URLs that differ only in tracking params the same lookup', () => {
    const a = normalizeRouteLookupSearch('?id=5&utm_source=newsletter&fbclid=abc');
    const b = normalizeRouteLookupSearch('?gclid=xyz&id=5&utm_source=ads');

    expect(a).toBe('?id=5');
    expect(b).toBe(a);
  });
});

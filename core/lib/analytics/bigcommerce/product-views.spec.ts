import { describe, expect, it } from 'vitest';

import { addProductView, MAX_TRACKED_PRODUCT_VIEWS, parseProductViews } from './product-views';

const VISIT_A = '0b9f1f4e-3c4a-4d8e-9a65-1f6b2c7d8e90';
const VISIT_B = '6d2c5a1b-8e7f-4a3b-9c0d-2e1f4a5b6c7d';

describe('addProductView', () => {
  it('records the first view of a product in a visit', () => {
    expect(addProductView(undefined, VISIT_A, 101)).toBe(`${VISIT_A}.101`);
  });

  it('skips a product already viewed in the same visit', () => {
    const first = addProductView(undefined, VISIT_A, 101) ?? undefined;

    expect(addProductView(first, VISIT_A, 101)).toBeNull();
  });

  it('records a different product in the same visit', () => {
    expect(addProductView(`${VISIT_A}.101`, VISIT_A, 202)).toBe(`${VISIT_A}.101.202`);
  });

  it('records the product again in a new visit', () => {
    expect(addProductView(`${VISIT_A}.101`, VISIT_B, 101)).toBe(`${VISIT_B}.101`);
  });

  it('drops the oldest ids once the cap is reached', () => {
    let value: string | undefined;

    for (let id = 1; id <= MAX_TRACKED_PRODUCT_VIEWS; id += 1) {
      value = addProductView(value, VISIT_A, id) ?? value;
    }

    const next = addProductView(value, VISIT_A, MAX_TRACKED_PRODUCT_VIEWS + 1) ?? '';
    const ids = parseProductViews(next, VISIT_A);

    expect(ids).toHaveLength(MAX_TRACKED_PRODUCT_VIEWS);
    expect(ids).not.toContain(1);
    expect(ids).toContain(MAX_TRACKED_PRODUCT_VIEWS + 1);
  });
});

describe('parseProductViews', () => {
  it('ignores malformed ids', () => {
    expect(parseProductViews(`${VISIT_A}.101..abc.-5.202`, VISIT_A)).toEqual([101, 202]);
  });

  it('returns nothing for a cookie from another visit', () => {
    expect(parseProductViews(`${VISIT_A}.101`, VISIT_B)).toEqual([]);
  });
});

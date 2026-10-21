// The product views already reported for a visit, stored as
// `<visitId>.<productId>.<productId>...` so repeat hits on a PDP don't each
// send a `ProductViewed` event.
const SEPARATOR = '.';

// Keeps the cookie small on long visits. Dropping the oldest ids only means a
// product viewed long ago in the visit can be reported once more.
export const MAX_TRACKED_PRODUCT_VIEWS = 50;

export function parseProductViews(value: string | undefined, visitId: string): number[] {
  if (!value) {
    return [];
  }

  const [cookieVisitId, ...ids] = value.split(SEPARATOR);

  // Views recorded under another visit don't count toward this one.
  if (cookieVisitId !== visitId) {
    return [];
  }

  return ids.map(Number).filter((id) => Number.isInteger(id) && id > 0);
}

// Returns the updated cookie value, or null when the product was already
// reported in this visit.
export function addProductView(
  value: string | undefined,
  visitId: string,
  productId: number,
): string | null {
  const viewed = parseProductViews(value, visitId);

  if (viewed.includes(productId)) {
    return null;
  }

  const ids = [...viewed, productId].slice(-MAX_TRACKED_PRODUCT_VIEWS);

  return [visitId, ...ids].join(SEPARATOR);
}

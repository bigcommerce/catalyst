import { TaxDisplay } from '~/data-transformers/prices-transformer';

// Picks the prices field (`pricesIncludingTax` or `pricesExcludingTax`) that matches the
// merchant's Tax Display CP setting. Used by analytics, SEO/schema, and any other non-visual
// consumer that needs one canonical price per product.
//
// - `INC`             -> `pricesIncludingTax`
// - `EX`              -> `pricesExcludingTax`
// - `BOTH`            -> `pricesIncludingTax` (headline convention)
// - undefined / null  -> `pricesExcludingTax` (matches BC `prices(currencyCode)` default)
export function pickPricesForTaxDisplay<
  T extends { pricesIncludingTax?: unknown; pricesExcludingTax?: unknown },
>(
  pricing: T,
  taxDisplay: TaxDisplay | null | undefined,
): T['pricesIncludingTax'] | T['pricesExcludingTax'] {
  if (taxDisplay === 'INC' || taxDisplay === 'BOTH') {
    return pricing.pricesIncludingTax;
  }

  return pricing.pricesExcludingTax;
}

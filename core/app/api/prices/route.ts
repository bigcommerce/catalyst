import { NextRequest, NextResponse } from 'next/server';
import { getSessionCustomerAccessToken } from '~/auth';
import { getProductPrices } from '~/belami/lib/fetch-product-prices';
import { getPriceMaxRules } from '~/belami/lib/fetch-price-max-rules';

export const GET = async (
  request: NextRequest,
) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const searchParams = request.nextUrl.searchParams;
  const skus = searchParams.get('skus') ?? '';
  const pmx = searchParams.get('pmx') || undefined;

  const priceMaxTriggers = pmx 
    ? JSON.parse(atob(pmx)) 
    : undefined;

  //console.log(skus);

  const prices = await getProductPrices(skus.split(','), customerAccessToken);

  const rules = prices && priceMaxTriggers && Object.keys(prices).length > 0 && Object.values(priceMaxTriggers).length > 0 ? await getPriceMaxRules(priceMaxTriggers) : null;

  if (rules && rules.length > 0) {
    Object.keys(prices).forEach((sku) => {

      //const rule = rules.find((r: any) => r.skus && r.skus.includes(sku));
      const rule = rules.find((r: any) => r.skus);

      if (rule && !!rule.discount) {
        const price = prices[sku].price;
        const salePrice = prices[sku].salePrice;
        const discount = Number(rule.discount);
        const discountedPrice = price - (price * discount / 100);
        prices[sku].salePrice = !!salePrice && Number(salePrice) < discountedPrice ? salePrice : discountedPrice.toFixed(2);
      }
    });
  }

  return NextResponse.json({
    status: 'OK',
    message: 'Prices retrieved successfully!',
    data: prices
  }, {
    status: 200
  });
};

export const runtime = 'nodejs';
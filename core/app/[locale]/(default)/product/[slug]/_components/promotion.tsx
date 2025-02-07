'use client';

import { findApplicablePromotion, getPromotionDecoration } from "~/belami/components/search/hit";

interface PromotionProps {
  promotions: any[] | null;
  product_id: number;
  brand_id: number;
  category_ids: number[];
  free_shipping: boolean;
}

export function Promotion({
  promotions,
  product_id,
  brand_id,
  category_ids,
  free_shipping,
}: PromotionProps) {
  const promotion = findApplicablePromotion(promotions || [], product_id, brand_id, category_ids);

  return (
    <>
      {promotion ? (
        <div className="mt-4 bg-gray-100 p-2 text-center">
          {getPromotionDecoration(promotion, free_shipping)}
        </div>
      ) : null}
    </>
  );
}
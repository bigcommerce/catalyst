export interface Coupon {
  readonly id: number;
  readonly code: string;
}

export interface PromotionWithCoupon {
  promotionId: number;
  coupon: Coupon;
}

export interface PromotionsApi {
  createCouponCode: () => Promise<PromotionWithCoupon>;
  deleteCouponCode: (promotionId: number, couponId: number) => Promise<void>;
}

export { promotionsHttpClient } from './http';

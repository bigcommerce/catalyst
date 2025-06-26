import { Fixture } from '~/tests/fixtures/fixture';
import { Coupon, PromotionWithCoupon } from '~/tests/fixtures/utils/api/promotions';

export class PromotionFixture extends Fixture {
  coupons: PromotionWithCoupon[] = [];

  async createCouponCode(): Promise<Coupon> {
    this.skipIfReadonly();

    const promoWithCoupon = await this.api.promotions.createCouponCode();

    this.coupons.push(promoWithCoupon);

    return promoWithCoupon.coupon;
  }

  async cleanup() {
    await Promise.all(
      this.coupons.map(({ promotionId, coupon }) =>
        this.api.promotions.deleteCouponCode(promotionId, coupon.id),
      ),
    );
  }
}

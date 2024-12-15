import { BcImage } from '~/components/bc-image';
import { useTranslations } from 'next-intl';

interface CouponProps {
  couponIcon: string;
}

export const Coupon = ({ couponIcon }: CouponProps) => {
  const t = useTranslations('productCoupon'); 

  return (
    <div className="product-coupon-section flex items-center gap-1">
      <BcImage
        alt="an assortment of brandless products against a blank background"
        height={10}
        priority={true}
        src={couponIcon} 
        width={20}
      />
      <div className="product-coupon text-left text-sm font-normal leading-6 tracking-wide">
        {t('couponText')}
      </div>
    </div>
  );
};
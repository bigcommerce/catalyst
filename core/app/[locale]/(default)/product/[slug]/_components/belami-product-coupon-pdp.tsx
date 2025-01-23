import { BcImage } from '~/components/bc-image';
import { useTranslations } from 'next-intl';

import couponIcon from '~/public/pdp-icons/couponIcon.svg'


export const Coupon = () => {
  const t = useTranslations('productCoupon');

  return (
    <div className="product-coupon-section flex items-center gap-1">
      <BcImage
        alt="an assortment of brandless products against a blank background"
        height={14}
        priority={true}
        src={couponIcon}
        width={22}
        unoptimized={true}
      />
      <div className="product-coupon text-left text-sm font-normal leading-6 tracking-wide">
        {t('couponText')}
      </div>
    </div>
  );
};

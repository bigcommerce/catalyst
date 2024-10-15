// Pay in Interest-free payments
import { useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';

export const Payment = () => {
  const t = useTranslations('payment'); // 'payment' refers to the object in en.json

  return (
    <div className="flex gap-4 mt-5 interest-free-payment justify-center items-center">
      <BcImage
        alt="payment-icon"
        src={imageManagerImageUrl('fill-11.png', '20w')}
        height={15}
        priority={true}
        width={15}
      />
      <p className='text-[0.75rem] font-normal leading-[1.125rem] tracking-[0.025rem]'>
        {t('payment')}{' '}
        <span>
          <a className="text-[#008BB7] border-b border-[#008BB7]" href="#">{t('learnMore')}</a>
        </span>
      </p>
    </div>
  );
};


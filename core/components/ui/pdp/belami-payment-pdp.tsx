// Pay in Interest-free payments
import { useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';
interface payPal {
  payPal: string;
}

export const Payment = ({ payPal }: payPal) => {
  const t = useTranslations('payment');

  return (
    <div className="interest-free-payment mt-5 flex items-center justify-center gap-4">
      <BcImage alt="payment-icon" src={payPal} height={15} priority={true} width={15} />
      <p className="text-[0.75rem] font-normal leading-[1.125rem] tracking-[0.025rem]">
        {t('payment')}{' '}
        <span>
          <a className="border-b border-[#008BB7] text-[#008BB7]" href="#">
            {t('learnMore')}
          </a>
        </span>
      </p>
    </div>
  );
};

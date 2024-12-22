// B2B Customers : Request a Quote or Create a Trade Account

import { useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';

interface requestQuote {
  requestQuote: string;
}

export const RequestQuote = ({ requestQuote }: requestQuote) => {
  const t = useTranslations('requestQuote');

  return (
    <div className="mt-6 flex items-center justify-between bg-[#E7F5F8] p-4 xl:mt-10">
      <div className="flex flex-1 justify-center">
        <p className="text-center text-[0.75rem] font-normal leading-[1.125rem] tracking-[0.025rem] text-[#000000]">
          <span className="block xl:contents">{t('heading')}</span>
          <span className="border-b border-[#008BB7] text-[#008BB7]">
            <a href="#">{t('requestQuoteLink')}</a>
          </span>
          <span className="mx-1">{t('or')}</span>
          <span className="border-b border-[#008BB7] text-[#008BB7]">
            <a href="#">{t('createTradeAccountLink')}</a>
          </span>
        </p>
      </div>
      <div className="request-quote-hands-icon flex-shrink-0 items-start">
        <BcImage alt="request-quote" src={requestQuote} height={10} priority={true} width={25} />
      </div>
    </div>
  );
};

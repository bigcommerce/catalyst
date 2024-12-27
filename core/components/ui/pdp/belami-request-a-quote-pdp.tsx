// B2B Customers : Request a Quote or Create a Trade Account

import { useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';

interface requestQuote {
  requestQuote : string;
}

export const RequestQuote = ({requestQuote} : requestQuote) => {
  const t = useTranslations('requestQuote');

  return (
    <div className="mt-6 xl:mt-10 flex justify-between items-center bg-[#E7F5F8] p-4">
      <div className="flex flex-1 justify-center">
        <p className="text-[0.75rem] text-[#000000] font-normal leading-[1.125rem] tracking-[0.025rem] text-center">
          <span className='block xl:contents'>{t('heading')}</span>
          <span className="text-[#008BB7] border-b border-[#008BB7]">
            <a href="#">
              {t('requestQuoteLink')}
            </a>
          </span>
          <span className="mx-1">{t('or')}</span>
          <span className="text-[#008BB7] border-b border-[#008BB7]">
            <a href="#">
              {t('createTradeAccountLink')}
            </a>
          </span>
        </p>
      </div>
      <div className="flex-shrink-0 items-start request-quote-hands-icon">
        <BcImage
          alt="request-quote"
          src={requestQuote}
          height={10}
          priority={true}
          width={25}
        />
      </div>
    </div>
  );
};


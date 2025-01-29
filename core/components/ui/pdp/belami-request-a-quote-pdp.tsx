// B2B Customers : Request a Quote or Create a Trade Account

import { useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';
import Link from 'next/link';
import { Flyout } from '~/components/common-flyout';

interface props {
 
  children: React.ReactNode;
}

export const RequestQuote = ({ children}:props) => {
  const t = useTranslations('requestQuote');

  return (
    <div className="mt-3 flex items-center justify-between bg-[#E7F5F8] p-4 xl:mt-[1.5em]">
      <div className="flex flex-1 justify-center">
        <p className="text-center text-[0.75rem] font-normal leading-[1.125rem] tracking-[0.025rem] text-[#000000]">
          <span className="block xl:contents">{t('heading')}</span>
          <span className="border-b border-[#006380] text-[#006380]">
            {/* <Link href="#">{t('requestQuoteLink')}</Link> */}
             <Flyout triggerLabel={t('requestQuoteLink')}>{children}</Flyout>
          </span>
          <span className="mx-1">{t('or')}</span>
          <span className="border-b border-[#006380] text-[#006380]">
            <Link href="/trade-account/trade-step1">{t('createTradeAccountLink')}</Link>
          </span>
        </p>
      </div>
      <div className="request-quote-hands-icon flex-shrink-0 items-start">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M0.975098 6.99998C0.975098 5.33331 1.5626 3.91248 2.7376 2.73748C3.9126 1.56248 5.33343 0.974976 7.0001 0.974976V2.99998C5.9001 2.99998 4.95843 3.39164 4.1751 4.17498C3.39176 4.95831 3.0001 5.89998 3.0001 6.99998H0.975098ZM5.3001 18.725C3.78343 17.2083 3.0251 15.3833 3.0251 13.25C3.0251 11.1166 3.78343 9.29164 5.3001 7.77498L7.0501 5.99998L7.3501 6.29998C7.83343 6.78331 8.0751 7.37081 8.0751 8.06248C8.0751 8.75414 7.83343 9.34164 7.3501 9.82498L7.0001 10.175C6.8001 10.375 6.7001 10.6125 6.7001 10.8875C6.7001 11.1625 6.8001 11.4 7.0001 11.6L7.9001 12.5C8.33343 12.9333 8.5501 13.4583 8.5501 14.075C8.5501 14.6916 8.33343 15.2166 7.9001 15.65L8.9751 16.725C9.70843 15.9916 10.0751 15.1125 10.0751 14.0875C10.0751 13.0625 9.7001 12.175 8.9501 11.425L8.4001 10.875C8.83343 10.4416 9.14176 9.95414 9.3251 9.41248C9.50843 8.87081 9.58343 8.31664 9.5501 7.74998L14.0251 3.27498C14.2251 3.07498 14.4626 2.97498 14.7376 2.97498C15.0126 2.97498 15.2501 3.07498 15.4501 3.27498C15.6501 3.47498 15.7501 3.71248 15.7501 3.98748C15.7501 4.26248 15.6501 4.49998 15.4501 4.69998L10.7751 9.37498L11.8251 10.425L17.8501 4.42498C18.0501 4.22498 18.2834 4.12498 18.5501 4.12498C18.8168 4.12498 19.0501 4.22498 19.2501 4.42498C19.4501 4.62498 19.5501 4.85831 19.5501 5.12498C19.5501 5.39164 19.4501 5.62498 19.2501 5.82498L13.2501 11.85L14.3001 12.9L19.6001 7.59998C19.8001 7.39998 20.0376 7.29998 20.3126 7.29998C20.5876 7.29998 20.8251 7.39998 21.0251 7.59998C21.2251 7.79998 21.3251 8.03748 21.3251 8.31248C21.3251 8.58748 21.2251 8.82498 21.0251 9.02498L15.7251 14.325L16.7751 15.375L20.8251 11.325C21.0251 11.125 21.2626 11.025 21.5376 11.025C21.8126 11.025 22.0501 11.125 22.2501 11.325C22.4501 11.525 22.5501 11.7625 22.5501 12.0375C22.5501 12.3125 22.4501 12.55 22.2501 12.75L16.2501 18.725C14.7334 20.2416 12.9084 21 10.7751 21C8.64176 21 6.81676 20.2416 5.3001 18.725ZM17.0001 23.025V21C18.1001 21 19.0418 20.6083 19.8251 19.825C20.6084 19.0416 21.0001 18.1 21.0001 17H23.0251C23.0251 18.6666 22.4376 20.0875 21.2626 21.2625C20.0876 22.4375 18.6668 23.025 17.0001 23.025Z"
            fill="#4EAECC"
          />
        </svg>
      </div>
    </div>
  );
};

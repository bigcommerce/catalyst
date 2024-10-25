import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { locales, LocaleType } from '~/i18n/routing';
import { imageIconList } from '../fragments';
import { LoginForm } from './_components/login-form';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { BcImage } from '~/components/bc-image';

export async function generateMetadata() {
  const t = await getTranslations('Login');

  return {
    title: t('title'),
  };
}

const patjoheatAndShade = imageManagerImageUrl('patjoheat-and-shade.png', '95w');
const baileyStreet = imageManagerImageUrl('bailey-street.png', '138w');
const OneStopLightning = imageManagerImageUrl('1stop-lightning.png', '194w');
const lunaWarehouse = imageManagerImageUrl('luna-warehouse.png', '298w');
const canadaLightning = imageManagerImageUrl('canada-lightning.png', '228w');
const homeclickBlack = imageManagerImageUrl('homeclick-black.png', '150w');

interface Props {
  params: { locale: LocaleType };
}

const person = imageManagerImageUrl('person.png', '16w');
const checkCircle = imageManagerImageUrl('check-circle.png', '20w');

export default function Login({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = useTranslations('Login');

  return (
    <>
      <div className='absolute w-full block left-0 bg-[#F3F4F5]'>
        <div className="flex flex-row items-center justify-center gap-[30px] px-0 py-[20px]">
          <BcImage
            alt="PatJoheat"
            width={95}
            height={40}
            unoptimized={true}
            src={patjoheatAndShade}
          />
          <BcImage
            alt="PatJoheat"
            width={95}
            height={40}
            unoptimized={true}
            src={baileyStreet}
          />
          <BcImage
            alt="1Stop"
            width={194}
            height={40}
            unoptimized={true}
            src={OneStopLightning}
          />
          <BcImage
            alt="Luna"
            width={298}
            height={40}
            unoptimized={true}
            src={lunaWarehouse}
          />
          <BcImage
            alt="Canada Lighting"
            width={228}
            height={40}
            unoptimized={true}
            src={canadaLightning}
          />
          <BcImage
            alt="Bailey Street"
            width={138}
            height={40}
            unoptimized={true}
            src={homeclickBlack}
          />
        </div>
      </div>
      <div className="mt-[20px] flex flex-col gap-[20px] px-4 2xl:container sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0">
        <div className="login-div login-div-one px-[1px] mx-auto flex justify-between gap-24">
          <h2 className="text-[34px] font-normal text-[#353535]">Rewards Program</h2>
          <div className="flex flex-row flex-wrap content-center items-center justify-center gap-[10px] px-0 pb-0 pt-[10px]">
            <p className="flex items-center text-center text-[20px] font-medium tracking-[0.15px] text-[#002A37]">
              Shopping for a Business?
            </p>

            <button className="box-border flex flex-row justify-center items-center px-6 py-2 gap-1 max-w-[258px] bg-white border border-[#B4DDE9] rounded">
              <div className='font-medium text-sm flex items-center tracking-wide text-[#002A37]'>OPEN A TRADE ACCOUNT</div>
            </button>
          </div>
        </div>
        <div className="login-div px-[1px] font-weight-[500] mx-auto text-[20px] tracking-[0.15px]">
          Log In
        </div>
        <div className="login-div mx-auto mb-6 flex justify-center gap-24">
          {/* <h2 className="text-h2 mb-8 text-4xl font-black lg:text-5xl">{t('heading')}</h2> */}
          <div className="login-first-child mx-[1px] login-logo flex flex-grow flex-col">
            <LoginForm {...imageIconList} />
          </div>
          <div className="login-sec-child mx-[1px] flex flex-grow flex-col items-center gap-[20px] rounded-[5px] p-0">
            <div className="flex w-full flex-col gap-[20px] rounded-[5px] bg-[#008BB7] p-[40px] text-white">
              <h3 className="flex items-center justify-center text-center text-[34px] font-bold tracking-[0.25px]">
                {t('CreateAccount.heading')}
              </h3>
              {/* <p className="text-base font-semibold">{t('CreateAccount.accountBenefits')}</p> */}
              <div className="item-center flex flex-row justify-center">
                <Button
                  asChild
                  className="flex h-[42px] w-fit items-center justify-center gap-[5px] rounded-[3px] bg-white p-[5px] px-[10px] text-[#03465c] hover:text-[#03465c]"
                >
                  <Link href="/register">
                    {' '}
                    <img src={person} alt="" /> {t('CreateAccount.createLink')}
                  </Link>
                </Button>
              </div>
              <ul className="flex list-disc flex-col gap-[20px]">
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[20px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.fastCheckout')}
                  </p>
                </li>
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[20px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.multipleAddresses')}
                  </p>
                </li>
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[20px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.ordersHistory')}
                  </p>
                </li>
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[20px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.ordersTracking')}
                  </p>
                </li>
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[20px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.wishlists')}
                  </p>
                </li>
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[20px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.exclusiveAccess')}
                  </p>
                </li>
              </ul>
            </div>
            <div className="flex flex-col items-center gap-[20px] rounded-[5px] border border-black p-[20px_40px]">
              <h3 className="flex items-center text-center text-[24px] font-normal text-[#353535]">
                Current Offer Banner Placeholder
              </h3>
              <p className="flex items-center text-center text-[16px] font-medium tracking-[0.5px] text-[#353535]">
                Optional placeholder for if we want to advertise a specific member promotion
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';

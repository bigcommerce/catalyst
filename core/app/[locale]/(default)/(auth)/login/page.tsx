import { getTranslations, setRequestLocale } from 'next-intl/server';

// import Link as NxtLink from 'next/link';

import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { locales } from '~/i18n/routing';
import { imageIconList } from '../fragments';
import { LoginForm } from './_components/login-form';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { BcImage } from '~/components/bc-image';

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

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
const passwordHide = imageManagerImageUrl('eye-password-hide.png', '150w');

interface Props {
  params: Promise<{ locale: string }>;
}

const person = imageManagerImageUrl('person.png', '16w');
const checkCircle = imageManagerImageUrl('check-circle.png', '20w');

export default async function Login({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Login');

  const breadcrumbs: any = [
    {
      label: 'Rewards Program',
      href: '#',
    },
  ];

  return (
    <>
      <div>
      <div className="main-login-page w-full border-t-[10px] border-t-[#008BB7] bg-[#F3F4F5]">
        <div className="relative overflow-x-auto">
          <div className="flex min-w-fit items-center whitespace-nowrap py-5 pl-4 pr-4 md:justify-center md:py-[20px]">
            <div className="flex items-center gap-4 md:gap-[30px]">
              <div className="flex-none">
                <BcImage
                  alt="PatJoheat"
                  width={95}
                  height={40}
                  unoptimized={true}
                  src={patjoheatAndShade}
                  className="h-4 w-auto md:h-10 lg:h-6 xl:h-8 2xl:h-10"
                />
              </div>
              <div className="flex-none">
                <BcImage
                  alt="Bailey Street"
                  width={138}
                  height={40}
                  unoptimized={true}
                  src={baileyStreet}
                  className="h-4 w-auto md:h-10 lg:h-6 xl:h-8 2xl:h-10"
                />
              </div>
              <div className="flex-none">
                <BcImage
                  alt="1Stop Lightning"
                  width={194}
                  height={40}
                  unoptimized={true}
                  src={OneStopLightning}
                  className="h-4 w-auto md:h-10 lg:h-6 xl:h-8 2xl:h-10"
                />
              </div>
              <div className="flex-none">
                <BcImage
                  alt="Luna Warehouse"
                  width={298}
                  height={40}
                  unoptimized={true}
                  src={lunaWarehouse}
                  className="h-4 w-auto md:h-10 lg:h-6 xl:h-8 2xl:h-10"
                />
              </div>
              <div className="flex-none">
                <BcImage
                  alt="Canada Lighting"
                  width={228}
                  height={40}
                  unoptimized={true}
                  src={canadaLightning}
                  className="h-4 w-auto md:h-10 lg:h-6 xl:h-8 2xl:h-10"
                />
              </div>
              <div className="flex-none">
                <BcImage
                  alt="Homeclick Black"
                  width={150}
                  height={40}
                  unoptimized={true}
                  src={homeclickBlack}
                  className="h-4 w-auto md:h-10 lg:h-6 xl:h-8 2xl:h-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="m-auto mt-[20px] flex w-[92%] flex-col gap-[20px] px-0 xl:px-12 2xl:mx-auto 2xl:px-0">
        <ComponentsBreadcrumbs
          className="login-div login-breadcrumb mx-auto mt-[0.5rem] hidden w-[80%] px-[1px] lg:block"
          breadcrumbs={breadcrumbs}
        />
        <div className="login-div login-div-one mx-auto mt-3 flex w-full flex-col justify-between gap-0 px-[1px] text-center md:mt-6 lg:mt-0 xl:w-[80%] xl:flex-row xl:gap-24 xl:text-left">
          <h2 className="text-[24px] font-normal text-[#353535] md:text-[34px]">Rewards Program</h2>
          <div className="flex flex-row flex-wrap content-center items-center justify-center gap-[10px] px-0 pb-0 pt-[10px]">
            <p className="flex items-center text-center text-[20px] font-medium tracking-[0.15px] text-[#002A37]">
              Shopping for a Business?
            </p>

            <button className="box-border flex max-w-[258px] flex-row items-center justify-center gap-1 rounded border border-[#4EAECC] bg-white px-6 py-2 xl:border-[#B4DDE9]">
              <div className="flex items-center text-[14px] font-medium tracking-wide text-[#002A37]">
                <Link className="text-[16px]" href="/trade-account/trade-step1/">
                  OPEN A TRADE ACCOUNT
                </Link>
              </div>
            </button>
          </div>
        </div>
        <div className="login-div font-weight-[500] mx-auto w-[80%] px-[1px] text-center text-[20px] tracking-[0.15px] xl:text-left">
          Log In
        </div>

        <div className="login-div mx-auto mb-6 flex w-full flex-col justify-center lg:gap-[4.5rem] xl:w-[80%] xl:flex-row">
          <div className="login-first-child login-logo mx-[1px] flex w-[calc(90vw)] flex-grow flex-col self-center xl:w-[calc(35.28vw)] xl:self-auto">
            <LoginForm {...imageIconList} passwordHide={passwordHide} />
          </div>

          <div className="login-sec-child mx-[1px] mt-[7em] flex w-[calc(90vw)] flex-grow flex-col gap-[20px] self-center rounded-[5px] p-0 sm:mt-[7em] xl:mt-0 xl:w-[calc(35.28vw)] xl:items-center xl:self-auto">
            <div className="flex w-full flex-col gap-[20px] rounded-[5px] bg-[#008BB7] p-[40px] text-white">
              <h3 className="flex items-center justify-center text-center text-[34px] font-bold tracking-[0.25px]">
                {t('CreateAccount.heading')}
              </h3>

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
                  <p className="text-[19px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.fastCheckout')}
                  </p>
                </li>
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[19px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.multipleAddresses')}
                  </p>
                </li>
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[19px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.ordersHistory')}
                  </p>
                </li>
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[19px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.ordersTracking')}
                  </p>
                </li>
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[19px] font-normal tracking-[0.15px]">
                    {t('CreateAccount.wishlists')}
                  </p>
                </li>
                <li className="flex list-none flex-row items-center gap-[10px]">
                  <img className="mt-[5px] self-start" src={checkCircle} alt="" />
                  <p className="text-[19px] font-normal tracking-[0.15px]">
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
    </div>
    </>
  );
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';
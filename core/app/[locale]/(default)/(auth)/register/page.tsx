import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { RegisterCustomerForm } from './_components/register-customer-form';
import { getRegisterCustomerQuery } from './page-data';
import { BcImage } from '~/components/bc-image';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';

import facebookLogo from '~/public/accountIcons/faceBookIcon.svg'
import appleLogo from '~/public/accountIcons/appleIcon.svg'
import googleLogo from '~/public/accountIcons/googleIcon.svg'

import patjoheatAndShade from '~/public/accountIcons/patjoheatAndShade.svg'
import baileyStreet from '~/public/accountIcons/baileyStreet.svg'
import oneStopLightning from '~/public/accountIcons/oneStopLightning.svg'
import lunaWarehouse from '~/public/accountIcons/lunaWarehouse.svg'
import canadaLightning from '~/public/accountIcons/canadaLightning.svg'
import homeclickBlack from '~/public/accountIcons/homeclickBlack.svg'

const FALLBACK_COUNTRY = {
  entityId: 226,
  name: 'United States',
  code: 'US',
};

export async function generateMetadata() {
  const t = await getTranslations('Register');

  return {
    title: t('title'),
  };
}

const breadcrumbs: any = [
  {
    label: 'New Account',
    href: '#',
  },
];




export default async function Register() {
  const t = await getTranslations('Register');

  const registerCustomerData = await getRegisterCustomerQuery({
    address: { sortBy: 'SORT_ORDER' },
    customer: { sortBy: 'SORT_ORDER' },
  });

  if (!registerCustomerData) {
    notFound();
  }

  const {
    addressFields,
    customerFields,
    countries,
    defaultCountry = FALLBACK_COUNTRY.name,
    reCaptchaSettings,
  } = registerCustomerData;

  const {
    code = FALLBACK_COUNTRY.code,
    entityId = FALLBACK_COUNTRY.entityId,
    statesOrProvinces,
  } = countries.find(({ name }) => name === defaultCountry) || {};

  return (
    <div className="mx-5 sm:mx-auto [&_form_span.loading-span]:left-0 [&_form_span.loading-span]:top-0 mb-10 text-base lg:w-2/3">
      {/* Updated logo section with horizontal scroll */}
      {/* Updated logo section with fixed scroll starting position */}
      <div className="absolute left-0 w-full bg-[#F3F4F5]">
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
                  src={oneStopLightning}
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

      <div className="registeration-breadcrumbs-heading pt-[2.8em] md:pt-[6.8em]">
        <ComponentsBreadcrumbs
          className="login-div login-breadcrumb mx-auto flex w-full justify-center px-[1px]"
          breadcrumbs={breadcrumbs}
        />
        <h1 className="font-open-sans mt-2 text-center text-[24px] font-normal leading-[46.3px] tracking-[0.25px] text-[#353535] sm:mb-4  md:mb-4 md:text-[34px] xl:mb-8">
          Create a New Account
        </h1>
      </div>

      <RegisterCustomerForm
        addressFields={addressFields}
        countries={countries}
        customerFields={customerFields}
        defaultCountry={{ entityId, code, states: statesOrProvinces ?? [] }}
        reCaptchaSettings={bypassReCaptcha(reCaptchaSettings)}
      />

      <div className="mx-auto flex max-w-[600px] items-center justify-center pt-0">
        <div className="login-in-buttons flex w-full flex-col justify-between gap-[15px] lg:flex-row">
          <button className="flex h-[54px] w-full items-center justify-center gap-[10px] rounded-[3px] border border-[#d7d7d7] bg-[#FFFFFF] p-[15px] lg:w-[200px]">
            <BcImage
              alt="Facebook logo"
              className="Login-logo h-[24px] w-[24px]"
              src={facebookLogo}
              width={24}
              height={24}
              priority={true}
            />
            <p className="text-[20px] font-medium text-[#1877F2]">Facebook</p>
          </button>

          <button className="flex h-[54px] w-full items-center justify-center gap-[10px] rounded-[3px] border border-[#d7d7d7] bg-[#FFFFFF] p-[15px] lg:w-[200px]">
            <BcImage
              alt="Google logo"
              className="Login-logo h-[24px] w-[24px]"
              src={googleLogo}
              width={24}
              height={24}
              priority={true}
            />
            <p className="text-[20px] font-medium text-[#757575]">Google</p>
          </button>

          <button className="flex h-[54px] w-full items-center justify-center gap-[10px] rounded-[3px] border border-[#d7d7d7] bg-[#FFFFFF] p-[15px] lg:w-[200px]">
            <BcImage
              alt="Apple logo"
              className="Login-logo w-[24px] h-[24px]"
              src={appleLogo}
              width={24}
              height={24}
              priority={true}
            />
            <p className="text-[20px] font-medium text-[#353535]">Apple</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';

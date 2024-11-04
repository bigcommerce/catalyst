import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { RegisterCustomerForm } from './_components/register-customer-form';
import { getRegisterCustomerQuery } from './page-data';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
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
    label: 'Rewards Program',
    href: '#',
  },
];

// Define image URLs using the function
const patjoheatAndShade = imageManagerImageUrl('patjoheat-and-shade.png', '95w');
const baileyStreet = imageManagerImageUrl('bailey-street.png', '138w');
const oneStopLightning = imageManagerImageUrl('1stop-lightning.png', '194w');
const lunaWarehouse = imageManagerImageUrl('luna-warehouse.png', '298w');
const canadaLightning = imageManagerImageUrl('canada-lightning.png', '228w');
const homeclickBlack = imageManagerImageUrl('homeclick-black.png', '150w');
const facebookLogo = imageManagerImageUrl('facebook-blue.png', '16w');
const google = imageManagerImageUrl('google-logo.png', '23w');
const appleLogo = imageManagerImageUrl('apple-black.png', '24w');

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
    <div className="mx-auto mb-10 text-base lg:w-2/3">
      <div className="absolute left-0 block w-full bg-[#F3F4F5]">
        <div className="flex flex-row items-center justify-center gap-[30px] px-0 py-[20px]">
          <BcImage
            alt="PatJoheat"
            width={95}
            height={40}
            unoptimized={true}
            src={patjoheatAndShade}
          />
          <BcImage
            alt="Bailey Street"
            width={138}
            height={40}
            unoptimized={true}
            src={baileyStreet}
          />
          <BcImage
            alt="1Stop Lightning"
            width={194}
            height={40}
            unoptimized={true}
            src={oneStopLightning}
          />
          <BcImage
            alt="Luna Warehouse"
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
            alt="Homeclick Black"
            width={150}
            height={40}
            unoptimized={true}
            src={homeclickBlack}
          />
        </div>
      </div>

      <div className="registeration-breadcrumbs-heading pt-[6.8em]">
        <ComponentsBreadcrumbs
          className="login-div login-breadcrumb mx-auto flex w-full justify-center px-[1px]"
          breadcrumbs={breadcrumbs}
        />
        <h1 className="font-open-sans mb-8 mt-2 text-center text-[34px] font-normal leading-[46.3px] tracking-[0.25px] text-[#353535]">
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

      <div className="flex items-center justify-center pt-0">
        {/* Social buttons */}
        <div className="login-in-buttons flex h-[54px] w-full flex-row justify-between gap-[20px]">
          {/* Log In with Facebook Button */}
          <button className="flex h-[54px] w-[144px] items-center justify-center gap-[10px] rounded-[3px] border border-[#d7d7d7] bg-[#FFFFFF] p-[15px]">
            <BcImage
              alt="Facebook logo"
              className="Login-logo h-[24px] w-[24px]"
              src={facebookLogo}
              width={20}
              height={20}
              priority={true}
            />{' '}
            <p className="text-[20px] font-medium text-[#1877F2]">Facebook</p>
          </button>

          {/* Log In with Google Button */}
          <button className="flex h-[54px] w-[144px] items-center justify-center gap-[10px] rounded-[3px] border border-[#d7d7d7] bg-[#FFFFFF] p-[15px]">
            <BcImage
              alt="Google logo"
              className="Login-logo h-[24px] w-[24px]"
              src={google}
              width={20}
              height={20}
              priority={true}
            />{' '}
            <p className="text-[20px] font-medium text-[#757575]">Google</p>
          </button>

          {/* Log In with Apple Button */}
          <button className="flex h-[54px] w-[144px] items-center justify-center gap-[10px] rounded-[3px] border border-[#d7d7d7] bg-[#FFFFFF] p-[15px]">
            <BcImage
              alt="Apple logo"
              className="Login-logo w-[24px]"
              src={appleLogo}
              width={24}
              height={24}
              priority={true}
            />{' '}
            <p className="text-[20px] font-medium text-[#353535]">Apple</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';

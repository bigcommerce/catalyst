import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { RegisterCustomerForms } from './_componentss/register-customer-forms';
import { getRegisterCustomerQuerys } from './page-datas';
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
const tradeAccountHeader = imageManagerImageUrl('trade-account-header.png', '100w');
export default async function trade() {
  const t = await getTranslations('Register');

  const registerCustomerData = await getRegisterCustomerQuerys({
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
    <div className="mx-auto mb-10 text-base">
      {/* Logo Section */}
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

      {/* Main Content Section */}
      <div className="registeration-breadcrumbs-heading pt-[2.8em] md:pt-[6.8em]">
        <ComponentsBreadcrumbs
          className="login-div login-breadcrumb mx-auto flex w-full justify-center px-[1px]"
          breadcrumbs={breadcrumbs}
        />

        {/* Hero Image with Overlay Section */}
        <div className="relative mb-8 mt-4 w-full">
          {/* Background Image */}
          <div className="h-[300px] w-full overflow-hidden">
            <BcImage
              alt="Hero Background"
              width={1200}
              height={300}
              unoptimized={true}
              src={tradeAccountHeader}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <h2 className="mb-2 text-center text-3xl font-semibold text-white md:text-4xl">
              Join Our Rewards Program
            </h2>
            <p className="text-center text-lg text-white/90 md:text-xl">
              Earn points and get exclusive benefits
            </p>
          </div>
        </div>

        {/* Create Account Heading */}
        <h1 className="font-open-sans mt-2 text-center text-[24px] font-normal leading-[46.3px] tracking-[0.25px] text-[#353535] sm:mb-4 sm:pb-2 md:mb-4 md:text-[34px] xl:mb-8">
          Create a New Account
        </h1>
      </div>

      {/* Registration Form */}
      <RegisterCustomerForms
        addressFields={addressFields}
        countries={countries}
        customerFields={customerFields}
        defaultCountry={{ entityId, code, states: statesOrProvinces ?? [] }}
        reCaptchaSettings={bypassReCaptcha(reCaptchaSettings)}
      />
    </div>
  );
}

export const runtime = 'edge';

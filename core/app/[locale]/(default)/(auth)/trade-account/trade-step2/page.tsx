import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { RegisterForm2 } from '../_components/register-form2';
import { getRegisterCustomerQuerys } from '../page-data';
import { imageManagerImageUrl } from '~/lib/store-assets';
import ImageCarousel from '../trade-carousel';
import NetworkSection from '../trade-step1/trade-our-network';
import { FormField } from '../_components/register-form1';
const TradeAddress1 = imageManagerImageUrl('add-circle.png', 'original');

const FALLBACK_COUNTRY = {
  entityId: 226,
  name: 'United States',
  code: 'US',
  statesOrProvinces: [] as {
    abbreviation: string;
    entityId: number;
    name: string;
    __typename: 'StateOrProvince';
  }[],
};

// Define image URLs
const imageUrls = {
  tradeAccountHeader: imageManagerImageUrl('trade-account-header.png', 'original'),
  tradeCircleCircle: imageManagerImageUrl('trade-check-circle.jpg', 'original'),
  patjoheatAndShade: imageManagerImageUrl('patjoheat-and-shade.png', 'original'),
  baileyStreet: imageManagerImageUrl('bailey-street.png', 'original'),
  oneStopLightning: imageManagerImageUrl('1stop-lightning.png', 'original'),
  lunaWarehouse: imageManagerImageUrl('luna-warehouse.png', 'original'),
  canadaLightning: imageManagerImageUrl('canada-lightning.png', 'original'),
  homeclickBlack: imageManagerImageUrl('homeclick-black.png', 'original'),
};

// Network images configuration
const networkImages = [
  {
    src: imageUrls.patjoheatAndShade,
    alt: 'PatJoheat',
    width: 95,
    height: 40,
  },
  {
    src: imageUrls.baileyStreet,
    alt: 'Bailey Street',
    width: 138,
    height: 40,
  },
  {
    src: imageUrls.oneStopLightning,
    alt: '1Stop Lightning',
    width: 194,
    height: 40,
  },
  {
    src: imageUrls.lunaWarehouse,
    alt: 'Luna Warehouse',
    width: 298,
    height: 40,
  },
  {
    src: imageUrls.canadaLightning,
    alt: 'Canada Lighting',
    width: 228,
    height: 40,
  },
  {
    src: imageUrls.homeclickBlack,
    alt: 'Homeclick Black',
    width: 150,
    height: 40,
  },
];

export async function generateMetadata() {
  const t = await getTranslations('Register');
  return {
    title: t('title'),
  };
}

type CarouselImage = {
  src: string;
  alt: string;
  height?: string;
};

const images: CarouselImage[] = [
  {
    src: imageManagerImageUrl('trade2-carosuel-img.jpg', 'original'),
    alt: 'trade2-carosuel-img',
  }
];

export default async function Trade() {
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
    defaultCountry: defaultCountryName = FALLBACK_COUNTRY.name,
    reCaptchaSettings: reCaptchaPromise,
  } = registerCustomerData;

  const reCaptchaSettings = await reCaptchaPromise;

  const selectedCountry =
    countries.find(({ name }) => name === defaultCountryName) || FALLBACK_COUNTRY;

  const defaultCountry = {
    entityId: selectedCountry.entityId,
    code: selectedCountry.code,
    states: selectedCountry.statesOrProvinces || [],
  };

  const filteredCountries = countries.filter(
    (country) => country.code === 'CA' || country.code === 'US',
  );

  return (
    <div className="trade-register-section min-h-screen bg-white pb-8 border-t-[10px] border-t-[#008BB7]">
      <div className="registeration-breadcrumbs-heading [&_.network-for-tab]:mt-0">
        {/* Breadcrumbs */}

        {/* Main Content */}
        <div className="mx-auto flex w-[92%] flex-col-reverse gap-6 lg:w-[94%] lg:flex-row lg:gap-[4.5em]">
          {/* Left Side Carousel */}
          <div className="mt-[1em] w-full lg:w-1/2 xl:mt-[2.8em]">
            <ImageCarousel images={images} height="800px" />
          </div>

          {/* Right Side Registration Form */}
          <div className="w-full lg:w-1/2">
            <div className="mt-[35px] flex items-center space-x-2 justify-center lg:justify-start">
              <a
                href="/trade-account/trade-step1/"
                className="text-left text-[16px] font-normal leading-8 tracking-[0.15px] text-black"
              >
                Apply
              </a>
              <span className="text-[#353535]">&gt;</span>
              <a
                href="#"
                className="text-left text-[16px] font-[700] leading-8 tracking-[0.15px] text-[#008BB7]"
              >
                Business Details
              </a>
              <span className="text-[#7F7F7F]">&gt;</span>
              <div className="text-left text-[16px] font-[400] leading-8 tracking-[0.15px] text-[#7F7F7F]">
                Confirmation
              </div>
            </div>

            <h2 className="m-auto mb-[30px] mt-[20px] text-center text-[20px] font-[500] leading-[32px] text-[#353535] lg:mb-[40px] lg:text-left">
              Quickly tell us about what you do.
            </h2>
            <div className="w-full max-w-screen-lg rounded-lg bg-white px-8 pb-[2.5em] pt-[2em] shadow-[0_0_30px_5px_rgba(0,0,0,0.06)] sm:px-6 sm:pb-[2em] sm:pt-[2em] md:px-8 md:pb-[2.2em] md:pt-[2em] xl:px-12 xl:pb-[3.5em] xl:pt-[2.5em]">
              <div className="w-full max-w-full">
                <RegisterForm2
                  TradeAddress1={TradeAddress1}
                  addressFields={addressFields as FormField[]}
                  countries={filteredCountries}
                  customerFields={customerFields as FormField[]}
                  defaultCountry={defaultCountry}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Network Section */}
        <div className="mt-[30px] lg:mt-[60px] lg:px-0">
          <NetworkSection networkImages={networkImages} />
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';

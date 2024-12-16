import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { bypassReCaptcha } from '~/lib/bypass-recaptcha';

import { RegisterForm2 } from '../_components/register-form2';
import { getRegisterCustomerQuerys } from '../page-data';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
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

const breadcrumbs = [
  {
    label: 'Apply',
    href: '/trade-account/trade-step1',
    color: '#000000',
    fontWeight: '400', // Changed to string
  },
  {
    label: 'Business Details',
    href: '/trade-account/trade-step2',
    color: '#008BB7',
    fontWeight: '600', // Changed to string
  },
  {
    label: 'Confirmation',
    href: '/trade-account/trade-step3',
    color: '#000000',
    fontWeight: '400', // Changed to string
  },
];

type CarouselImage = {
  src: string;
  alt: string;
  height?: string;
};

const images: CarouselImage[] = [
  {
    src: imageManagerImageUrl('trade2-carosuel-img.jpg', 'original'),
    alt: 'California Homebuilders Inc.',
  },
  {
    src: imageManagerImageUrl('trade2-carosuel-img.jpg', 'original'),
    alt: 'Modern Home Design',
  },
  {
    src: imageManagerImageUrl('trade2-carosuel-img.jpg', 'original'),
    alt: 'Luxury Homes',
  },
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

  return (
    <div className="trade-register-section min-h-screen bg-white pb-8">
      <div className="registeration-breadcrumbs-heading">
        {/* Breadcrumbs */}

        {/* Main Content */}
        <div className="mx-auto flex w-[92%] lg:w-[94%] flex-col-reverse gap-6 lg:flex-row lg:gap-8">
          {/* Left Side Carousel */}
          <div className="xl:mt-[2.8em] mt-[1em] w-full lg:w-1/2">
            <ImageCarousel images={images} height="800px" />
          </div>

          {/* Right Side Registration Form */}
          <div className="w-full lg:w-1/2">
            <div className="trade2-breadcrumbs">
              <ComponentsBreadcrumbs
                className="trade2-div-breadcrumb flex w-[100%] lg:pb-[10px] lg:pt-[30px]"
                breadcrumbs={breadcrumbs}
              />
            </div>
            <h2 className="m-auto mb-[30px] lg:mb-[40px] mt-[10px] text-center lg:text-left text-[20px] font-[500] leading-[32px] text-[#353535]">
              Quickly tell us about what you do.
            </h2>
            <div className="rounded-lg bg-white px-5 xl:px-0  xl:pb-[3.5em] pb-[2.5em] pt-[2em] shadow-[0_0_30px_5px_rgba(0,0,0,0.06)]">
              <RegisterForm2
                TradeAddress1={TradeAddress1}
                addressFields={addressFields as FormField[]}
                countries={countries}
                customerFields={customerFields as FormField[]}
                defaultCountry={defaultCountry}
              />
            </div>
          </div>
        </div>

        {/* Network Section */}
        <div className="mt-[30px] lg:mt-[60px] px-[20px] lg:px-0">
          <NetworkSection networkImages={networkImages} />
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
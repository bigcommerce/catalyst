// export const runtime = 'edge';

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { RegisterForm1 } from '../_components/register-form1';
import { getRegisterCustomerQuerys } from '../page-data';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';
import ImageCarousel from '../trade-carousel';
import TradeForm from './trade-form-section';
import NetworkSection from './trade-our-network';
import BrandPartnersSection, { TestimonialData } from './trade-brand-partner';
import TeamMembersSection from './trade-team-member';
import HappyProsSection from './trade-testimonial';
import type { FormField } from '../_components/register-form1';

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

export async function generateMetadata() {
  const t = await getTranslations('Register');
  return {
    title: t('title'),
  };
}

interface AddressFormField {
  __typename: 'TextFormField';
  entityId: number;
  label: string;
  sortOrder: number;
  isBuiltIn: boolean;
  isRequired: boolean;
  defaultText: string | null;
  maxLength: number | null;
}

export interface RegisterForm1Props {
  addressFields: AddressFormField[];
  customerFields: FormField[];
  countries: Array<{
    code: string;
    entityId: number;
    name: string;
    __typename: 'Country';
    statesOrProvinces: Array<{
      abbreviation: string;
      entityId: number;
      name: string;
      __typename: 'StateOrProvince';
    }>;
  }>;
  defaultCountry: {
    code: string;
    states: Array<{ name: string }>;
  };
  reCaptchaSettings: any;
}

import patjoheatAndShade from '~/public/accountIcons/patjoheatAndShade.svg'
import baileyStreet from '~/public/accountIcons/baileyStreet.svg'
import OneStopLightning from '~/public/accountIcons/oneStopLightning.svg'
import lunaWarehouse from '~/public/accountIcons/lunaWarehouse.svg'
import canadaLightning from '~/public/accountIcons/canadaLightning.svg'
import homeclickBlack from '~/public/accountIcons/homeclickBlack.svg'
import tradeCheckCircle from '~/public/accountIcons/tradeCheckCircle.svg'

const imageUrls = {
  tradeAccountHeader: imageManagerImageUrl('trade-account-header.png', 'original'),
  tradeCircleCircle: tradeCheckCircle,
  patjoheatAndShade: patjoheatAndShade,
  baileyStreet: baileyStreet,
  oneStopLightning: OneStopLightning,
  lunaWarehouse: lunaWarehouse,
  canadaLightning: canadaLightning,
  homeclickBlack: homeclickBlack,
};

const testimonials: TestimonialData[] = [
  {
    imageSrc: imageManagerImageUrl('quorem-trade.png', 'original'),
    imageAlt: 'Fast Shipping',
    testimonial:
      '"1StopLighting.com has been an invaluable partner for Quorum Brands, consistently exceeding our expectations as the go-to resource for builders, electricians, and lighting professionals. Their comprehensive understanding of Quorum products, combined with their unwavering commitment to customer satisfaction, sets them apart in the industry. Their dedication to excellence makes them our trusted ally."',
    name: 'Field Bradford',
    position: 'National Sales Manager',
  },
  {
    imageSrc: imageManagerImageUrl('quoizel-trade.png', 'original'),
    imageAlt: 'Reliable Support',
    testimonial:
      '"Belami not only offers top-tier products within the Pro category, seamlessly blending functionality and design, but also ensures unparalleled customer service, responsiveness, and expertise. Amidst the complexities of the industry, you can confidently rely on the Belami team to deliver the best fixtures for your projects."',
    name: 'Howard Greenberg',
    position: 'Director of Sales',
  },
  {
    imageSrc: imageManagerImageUrl('maxim-trade.jpg', 'original'),
    imageAlt: 'Quality Products',
    testimonial:
      '"Maxim/ET2 has a well-established professional relationship with the Belami team. They have proven to be a top tier partner working alongside trade professionals and helping grow a client\'s business. Balami\'s Pro team is second to none when it comes to product knowledge, logistic accuracy, and customer service."',
    name: 'Jason Eberhardt',
    position: 'National E-commerce Accounting Manager',
  },
];

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

type CarouselImage = {
  src: string;
  alt: string;
  title: string;
  height?: string;
};

const images: CarouselImage[] = [
  {
    src: imageManagerImageUrl('trade-carousel-1.jpg', 'original'),
    alt: 'California Homebuilders Inc.',
    title: 'California Homebuilders Inc.',
  },
  {
    src: imageManagerImageUrl('trade-carousel-1.jpg', 'original'),
    alt: 'Modern Home Design',
    title: 'Modern Home Design',
  },
  {
    src: imageManagerImageUrl('trade-carousel-1.jpg', 'original'),
    alt: 'Luxury Homes',
    title: 'Luxury Homes',
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
    <div className="trade-register-section bg-[#d3d3d338]">
      <div className="registeration-breadcrumbs-heading">
        {/* Hero Image Section */}
        <div className="relative w-full">
          <div className="trade-banner mb-[30px] lg:mb-[0px]">
            <BcImage
              alt="Hero Background"
              width={1600}
              height={300}
              unoptimized={true}
              src={imageUrls.tradeAccountHeader}
              className="trade-banner-image"
            />
          </div>
        </div>

        <div className="m-auto flex w-[88%] flex-col-reverse lg:m-[unset] lg:w-[96.5%] lg:flex-row lg:justify-between lg:space-x-8 xl:mt-[100px]">
          <TradeForm tradeCircleCircle={imageUrls.tradeCircleCircle} />

          <div className="mb-5 rounded-lg bg-white p-[20px] shadow-md md:pb-[3em] md:pt-[3em] lg:mb-0 lg:w-1/2">
            <h2 className="mb-[15px] text-center text-[25px] font-normal leading-[32px] text-[#353535] lg:text-[34px]">
              Apply Today
            </h2>
            <RegisterForm1
              addressFields={addressFields as AddressFormField[]}
              countries={countries}
              customerFields={customerFields as FormField[]}
              defaultCountry={defaultCountry}
              reCaptchaSettings={reCaptchaSettings}
            />
          </div>
        </div>

        <h2 className="mb-[40px] mt-[0px] hidden text-center text-[24px] font-normal leading-[32px] text-[#353535] xl:mt-[40px] xl:block">
          Our Network
        </h2>

        <NetworkSection networkImages={networkImages} />

        <BrandPartnersSection testimonials={testimonials} />

        <div className="w-full">
          <h2 className="mb-[40px] mt-[10px] text-center text-[24px] font-normal leading-[32px] text-[#353535]">
            Our Partner Projects in Action
          </h2>
          <div className="m-auto w-[95%] px-4">
            <ImageCarousel images={images} height="520px" />
          </div>
        </div>

        <TeamMembersSection />

        <HappyProsSection />
      </div>
    </div>
  );
}

export const runtime = 'edge';

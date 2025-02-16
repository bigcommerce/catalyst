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

import TradeBannerDesk from '~/public/tradeAccount/trade_desk.png';
import TradeBannerTab from '~/public/tradeAccount/trade_tab.png';
import TradeBannerMob from '~/public/tradeAccount/trade_mob.png';
import Trade20 from '~/public/tradeAccount/20_desk.png';

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

import patjoheatAndShade from '~/public/accountIcons/patjoheatAndShade.svg';
import baileyStreet from '~/public/accountIcons/baileyStreet.svg';
import OneStopLightning from '~/public/accountIcons/oneStopLightning.svg';
import lunaWarehouse from '~/public/accountIcons/lunaWarehouse.svg';
import canadaLightning from '~/public/accountIcons/canadaLightning.svg';
import homeclickBlack from '~/public/accountIcons/homeclickBlack.svg';
import tradeCheckCircle from '~/public/accountIcons/tradeCheckCircle.svg';

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
    src: imageManagerImageUrl('california-homebuilders-inc-3-1.jpeg', 'original'),
    alt: 'California Homebuilders Inc.',
    title: 'California Homebuilders Inc.',
  },
  {
    src: imageManagerImageUrl('california-homebuilders-inc-2-2.jpeg', 'original'),
    alt: 'California Homebuilders Inc.',
    title: 'California Homebuilders Inc.',
  },
  {
    src: imageManagerImageUrl('travis-ferran-1-3.jpeg', 'original'),
    alt: 'Travis Ferran',
    title: 'Travis Ferran',
  },
  {
    src: imageManagerImageUrl('windsor-1-crystorama-4.jpeg', 'original'),
    alt: 'Windsor',
    title: 'Windsor',
  },
  {
    src: imageManagerImageUrl('windsor-2-crystorama-5.jpeg', 'original'),
    alt: 'Windsor',
    title: 'Windsor',
  },
  {
    src: imageManagerImageUrl('cutter-landscaping-2-6.jpeg', 'original'),
    alt: 'Cutter Landscaping',
    title: 'Cutter Landscaping',
  },
  {
    src: imageManagerImageUrl('cutter-landscaping-7-7.jpeg', 'original'),
    alt: 'Cutter Landscaping',
    title: 'Cutter Landscaping',
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
      <div className="registeration-breadcrumbs-heading border-t-[10px] border-t-[#008BB7]">
        {/* Hero Image Section */}
        <div className="relative w-full xl:border-t xl:border-t-white">
          <div className="trade-banner mb-[30px] xl:mb-[0px]">
            <div className="relative bg-black/50 xl:bg-[unset]">
              <BcImage
                src={TradeBannerDesk}
                width={1600}
                height={173}
                unoptimized={true}
                alt="Hero Background"
                className="hidden w-full xl:block"
              />
              <BcImage
                src={TradeBannerTab}
                width={744}
                height={194}
                unoptimized={true}
                alt="Hero Background"
                className="h-[194px] w-full hidden sm:block xl:hidden"
              />

              <BcImage
                src={TradeBannerMob}
                width={375}
                height={194}
                unoptimized={true}
                alt="Hero Background"
                className="h-[194px] w-full block sm:hidden"
              />
              <BcImage
                src={Trade20}
                width={170}
                height={140}
                unoptimized={true}
                alt="20 Years"
                className="absolute left-1/2 right-[unset] top-[10%] h-[84px] w-[97px] -translate-x-[50%] -translate-y-[10%] xl:left-[unset] xl:right-[10%] xl:top-1/2 xl:block xl:h-[140px] xl:w-[170px] xl:-translate-y-[50%]"
              />
              <div className="absolute flex h-[116px] w-full -translate-y-[50%] items-center justify-center bg-[unset] text-center top-[calc(10%+105px)] sm:top-[calc(10%+105px)] xl:top-1/2 xl:bg-black/50">
                <div className="xl:text-[20px] text-[14px] font-[400] xl:font-[500] leading-[24px] xl:leading-[32px] tracking-[0.25px] xl:tracking-[0.15px] text-white w-[95%] sm:w-[90%] xl:w-[calc((710/1600)*100vw)]">
                  20+ Years Providing Quality Experiences to Builders, Multi-Family, Residential and
                  Light Commercial Professionals.
                </div>
              </div>
            </div>
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

// export const runtime = 'edge';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import {
  SiFacebook,
  SiInstagram,
  SiLinkedin,
  SiPinterest,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import { JSX } from 'react';

import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { Footer as ComponentsFooter } from '~/components/ui/footer';
import { logoTransformer } from '~/data-transformers/logo-transformer';

import { FooterFragment } from './fragment';
import { Link as CustomLink } from '~/components/link';

import { BcImage } from '../bc-image';

import bbbIcon from '~/public/footerIcons/bbbIcon.svg';
import payPalIcon from '~/public/footerIcons/payPalIcon.svg';
import visaIcon from '~/public/footerIcons/visaIcon.svg';
import paymentIcon from '~/public/footerIcons/paymentIcon.svg';
import discoverIcon from '~/public/footerIcons/discoverIcon.svg';
import amexIcon from '~/public/footerIcons/amexIcon.svg';
import brainTreeIcon from '~/public/footerIcons/brainTreeIcon.svg';
import Link from 'next/link';

const socialIcons: Record<string, { icon: JSX.Element; link: string }> = {
  Pinterest: {
    icon: <SiPinterest title="pinterest" color="#ffffff" />,
    link: 'https://pinterest.com',
  },
  YouTube: { icon: <SiYoutube title="YouTube" color="#ffffff" />, link: 'https://youtube.com' },
  Instagram: {
    icon: <SiInstagram title="Instagram" color="#ffffff" />,
    link: 'https://instagram.com',
  },
  Twitter: { icon: <SiX title="Twitter" color="#ffffff" />, link: 'https://x.com' },
  Facebook: { icon: <SiFacebook title="Facebook" color="#ffffff" />, link: 'https://facebook.com' },
};

export const Footer = async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const data = readFragment(FooterFragment, response).site;
  const sections = [
    {
      title: 'Shopping',
      links: [
        {
          label: <span className="footer-link shopping-link">On Sale</span>,
          href: 'search?on_sale=true',
        },
        { label: <span className="footer-link shopping-link">Our Brands</span>, href: '/brands' },
        {
          label: <span className="footer-link shopping-link">B2B and Trade Customers</span>,
          href: '/trade-account/trade-step1',
        },
        {
          label: <span className="footer-link shopping-link">View your Cart</span>,
          href: '/cart',
        },
        {
          label: <span className="footer-link shopping-link">Coupon Policy</span>,
          href: '/content/coupons',
        },
      ],
    },
    {
      title: 'About Us',
      links: [
        { label: <span className="footer-link about-link">About Us</span>, href: '/content/about-us' },
        { label: <span className="footer-link about-link">Partners</span>, href: '/content/partners' },
        {
          label: <span className="footer-link about-link">Privacy Policy</span>,
          href: '/content/privacy-and-security',
        },
        {
          label: <span className="footer-link about-link">Terms of Use</span>,
          href: '/content/terms-of-use',
        },
        {
          label: <span className="footer-link about-link">Accessibility</span>,
          href: '/content/accessibility-statement',
        },
      ],
    },
    {
      title: '',
      links: [
        {
          label: (
            <span className="footer-newsletter-text text-[16px] leading-[32px]">
              Be the first to know about new arrivals, sales, and more.
            </span>
          ),
          href: '#',
        },
        {
          label: (
            <div className="footer-subscribe !ml-[0em]">
              <form action="/subscribe" method="POST" className="flex items-center">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="subscription-input !placeholder:pl-[8px] h-[40px] w-[243px] pl-[12px] text-left tracking-[0.25px] text-[#6b7280] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px] focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="subscription-button relative h-[40px] w-[80px] bg-brand-400 xl:bg-[#006380] text-center text-[14px] font-normal uppercase text-white"
                >
                  Sign Up
                </button>
              </form>
            </div>
          ),
          href: '#',
        },
        {
          label: (
            <div className="footer-privacy-section">
              <span className="privacy-text text-left text-xs font-normal leading-[18px] tracking-[0.4px]">
                View our
              </span>
              <Link href={'/content/privacy-and-security/'}>
              <span className="privacy-link privacy-policy-label ml-2 text-left text-xs font-normal leading-[18px] tracking-[0.4px] underline">
                Privacy Policy
              </span>
              </Link>
            </div>
          ),
          href: '/content/privacy-and-security/',
        },
        {
          label: <span className="footer-social-title font-normal text-xs leading-[18px] tracking-[0.4px] mb-[4px]" >FOLLOW US</span>,
          href: '/',
        },
        {
          label: (
            <div className="footer-social-media !ml-[0px] !mt-[-9px] mb-[25px] flex">
              {socialIcons &&
                Object.entries(socialIcons).map(([key, value]) => (
                  <CustomLink
                    className="social-icon mr-[15px] w-[20px]"
                    key={key}
                    href={value?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {socialIcons?.[key]?.icon}
                  </CustomLink>
                ))}
            </div>
          ),
          href: '#',
        },
      ],
    },
  ];

  const customerService = [
    {label:'Start a Return or Replacement', href:'/returns'},
    {label:'View Order Status', href:'/#'},
    {label:'Visit our Helpdesk', href:'/content/help-center'},
  ]

  return (
    <ComponentsFooter
      contactInformation={data.settings?.contact ?? undefined}
      copyright={
        data.settings
          ? `© ${new Date().getFullYear()} ${data.settings.storeName} . All Rights Reserved`
          : undefined
      }
      logo={data.settings ? logoTransformer(data.settings) : undefined}
      paymentIcons={[
        <div className="flex items-center gap-[10px] justify-center flex-wrap">
          <BcImage
            src={bbbIcon}
            className="h-[24px] w-[63px]"
            alt="payment images"
            width={63}
            height={24}
            unoptimized={true}
          />
          <BcImage
            src={payPalIcon}
            className="h-[24px] w-[34px]"
            alt="payment images"
            width={34}
            height={24}
            unoptimized={true}
          />
          <BcImage
            src={visaIcon}
            className="h-[24px] w-[34px]"
            alt="payment images"
            width={34}
            height={24}
            unoptimized={true}
          />
          <BcImage
            src={paymentIcon}
            className="h-[24px] w-[34px]"
            alt="payment images"
            width={34}
            height={24}
            unoptimized={true}
          />
          <BcImage
            src={discoverIcon}
            className="h-[24px] w-[34px]"
            alt="payment images"
            width={34}
            height={24}
            unoptimized={true}
          />
          <BcImage
            src={amexIcon}
            className="h-[24px] w-[34px]"
            alt="payment images"
            width={34}
            height={24}
            unoptimized={true}
          />
          <BcImage
            src={brainTreeIcon}
            className="h-[24px] w-[89px]"
            alt="payment images"
            width={89}
            height={24}
            unoptimized={true}
          />
        </div>,
      ]}
      sections={sections}
      customerService={customerService}
    />
  );
};

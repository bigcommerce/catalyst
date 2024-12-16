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
import { AmazonIcon } from './payment-icons/amazon';
import { AmericanExpressIcon } from './payment-icons/american-express';
import { ApplePayIcon } from './payment-icons/apple-pay';
import { MastercardIcon } from './payment-icons/mastercard';
import { PayPalIcon } from './payment-icons/paypal';
import { VisaIcon } from './payment-icons/visa';
import { Link as CustomLink } from '~/components/link';

import { imageManagerImageUrl } from '~/lib/store-assets';

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
  const bbbIcon = imageManagerImageUrl('bbb.png', '63w');
  const payPalIcon = imageManagerImageUrl('paypalfooter.png', '34w');
  const visaIcon = imageManagerImageUrl('visa.png', '34w');
  const paymentIcon = imageManagerImageUrl('payment-icon.png', '34w');
  const discoverIcon = imageManagerImageUrl('discover.png', '34w');
  const amexIcon = imageManagerImageUrl('amex.png', '34w');
  const brainTreeIcon = imageManagerImageUrl('braintree.png', '89w');

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
        { label: <span className="footer-link shopping-link">Gift Cards</span>, href: '/path-1' },
        { label: <span className="footer-link shopping-link">On Sale</span>, href: '/path-2' },
        { label: <span className="footer-link shopping-link">Our Brands</span>, href: '/path-3' },
        {
          label: <span className="footer-link shopping-link">B2B and Trade Customers</span>,
          href: '/path-4',
        },
        {
          label: <span className="footer-link shopping-link">View your Cart</span>,
          href: '/path-5',
        },
        {
          label: <span className="footer-link shopping-link">Coupon Policy</span>,
          href: '/path-6',
        },
      ],
    },
    {
      title: 'About Us',
      links: [
        { label: <span className="footer-link about-link">About Us</span>, href: '/path-1' },
        { label: <span className="footer-link about-link">Partners</span>, href: '/path-2' },
        { label: <span className="footer-link about-link">Privacy Policy</span>, href: '/path-3' },
        { label: <span className="footer-link about-link">Terms of Use</span>, href: '/path-4' },
        {
          label: <span className="footer-link about-link">Affiliate Program</span>,
          href: '/path-5',
        },
        { label: <span className="footer-link about-link">Accessibility</span>, href: '/path-6' },
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
          href: '/path-1',
        },
        {
          label: (
            <div className="footer-subscribe !ml-[0em]">
              <form action="/subscribe" method="POST">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="subscription-input !placeholder:pl-[8px] h-[40px] w-[14em] pl-[12px] text-left tracking-[0.25px] text-[#6b7280] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px] focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="subscription-button relative top-[-1px] h-[40px] w-[85px] bg-[#008bb7] text-center text-[14px] font-normal uppercase text-white"
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
              <span className="privacy-link privacy-policy-label ml-2 text-left text-xs font-normal leading-[18px] tracking-[0.4px] underline">
                Privacy Policy
              </span>
            </div>
          ),
          href: '/path-6',
        },
        {
          label: <span className="footer-social-title">FOLLOW US</span>,
          href: '/path-6',
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
        }
      ],
    },
  ];

  return (
    <div>
      <ComponentsFooter
        contactInformation={data.settings?.contact ?? undefined}
        copyright={
          data.settings
            ? `© ${new Date().getFullYear()} ${data.settings.storeName} – Powered by BigCommerce`
            : undefined
        }
        logo={data.settings ? logoTransformer(data.settings) : undefined}
        paymentIcons={[
          // <AmazonIcon key="amazon" />,
          // <AmericanExpressIcon key="americanExpress" />,
          // <ApplePayIcon key="apple" />,
          // <MastercardIcon key="mastercard" />,
          // <PayPalIcon key="paypal" />,
          // <VisaIcon key="visa" />,

          <div className="flex items-center gap-[10px]">
            <img src={bbbIcon} className='w-[63px] h-[24px]' alt="payment images" width={63} height={24} />
            <img src={payPalIcon} className='w-[34px] h-[24px]' alt="payment images" width={34} height={24}/>
            <img src={visaIcon} className='w-[34px] h-[24px]' alt="payment images" width={34} height={24}/>
            <img src={paymentIcon} className='w-[34px] h-[24px]' alt="payment images" width={34} height={24}/>
            <img src={discoverIcon} className='w-[34px] h-[24px]' alt="payment images"width={34} height={24} />
            <img src={amexIcon} className='w-[34px] h-[24px]' alt="payment images" width={34} height={24}/>
            <img src={brainTreeIcon} className='w-[89px] h-[24px]' alt="payment images" width={89} height={24} />
          </div>,
        ]}
        sections={sections}
      />
   </div>
  );
};

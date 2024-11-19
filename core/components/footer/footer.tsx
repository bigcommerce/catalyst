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

const socialIcons: Record<string, { icon: JSX.Element, link: string }> = {
  Pinterest: { icon: <SiPinterest title="pinterest" color="#ffffff" />, link:'https://pinterest.com' },
  YouTube: { icon: <SiYoutube title="YouTube" color="#ffffff" />, link:'https://youtube.com' },
  Instagram: { icon: <SiInstagram title="Instagram" color="#ffffff" />, link:'https://instagram.com' },
  Twitter: { icon: <SiX title="Twitter" color="#ffffff" />, link:'https://x.com' },
  Facebook: { icon: <SiFacebook title="Facebook" color="#ffffff" />, link:'https://facebook.com' },
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
        { label: 'Gift Cards', href: '/path-1' },
        { label: 'On Sale', href: '/path-2' },
        { label: 'Our Brands', href: '/path-3' },
        { label: 'B2B and Trade Customers', href: '/path-4' },
        { label: 'View your Cart', href: '/path-5' },
        { label: 'Coupon Policy', href: '/path-6' },
      ],
    },
    {
      title: 'About Us',
      links: [
        { label: 'About Us', href: '/path-1' },
        { label: 'Partners', href: '/path-2' },
        { label: 'Privacy Policy', href: '/path-3' },
        { label: 'Terms of Use', href: '/path-4' },
        { label: 'Affiliate Program', href: '/path-5' },
        { label: 'Accessibility', href: '/path-6' },
      ],
    },
    {
      title: '',
      links: [
        { label: 'Be the first to know about new arrivals sales, and more.', href: '/path-1' }, 

        {
          label: (
            <div className="footer-subscribe !ml-[0em]">
              
              <form action="/subscribe" method="POST">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="subscription-input !placeholder:pl-[8px] placeholder:text-[14px] placeholder:font-normal placeholder:leading-[24px] tracking-[0.25px] text-left text-[#6b7280] h-[40px] focus:outline-none"
                  required
                />
<button 
  type="submit" 
  className="
    text-[14px] 
    font-normal 
    text-center 
    uppercase 
    w-[85px] 
    h-[40px] 
    bg-[#008bb7] 
    text-white 
    relative 
    top-[-1px]
    subscription-button
">
  Sign Up
</button>


              </form>
            </div>
          ),
          href: '#', // We can leave href as '#' because it's not a link
        },
        { 
          label: (
            <>
              <span>View our</span> <span className="privacy-policy-label">privacy policy</span>
            </>
          ), 
          href: '/path-6' 
        },
        { label: 'FOLLOW US', href: '/path-6' },
        
        {
          label: (
            
            <div className="footer-social-media flex !ml-[-7px]">
              
              {/* Social Media Icons Inside Footer */}
              {socialIcons && Object.entries(socialIcons).map(([key, value]) => (
                <CustomLink
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
          href: '#', // Placeholder since this is not a link
        },
        { label: 'Your Shopping ID:##########', href: '/path-6' },
      ],
    },
  ];

  return (
    <>
      <ComponentsFooter
        contactInformation={data.settings?.contact ?? undefined}
        copyright={
          data.settings
            ? `© ${new Date().getFullYear()} ${data.settings.storeName} – Powered by BigCommerce`
            : undefined
        }
        logo={data.settings ? logoTransformer(data.settings) : undefined}
        paymentIcons={[
          <AmazonIcon key="amazon" />,
          <AmericanExpressIcon key="americanExpress" />,
          <ApplePayIcon key="apple" />,
          <MastercardIcon key="mastercard" />,
          <PayPalIcon key="paypal" />,
          <VisaIcon key="visa" />,
        ]}
        sections={sections}
      />
    </>
  );
};

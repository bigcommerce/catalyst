import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import {
  SiFacebook,
  SiInstagram,
  SiPinterest,
  SiX,
  SiYoutube,
  SiLinkerd,
} from '@icons-pack/react-simple-icons';
import { useTranslations } from 'next-intl';
import { cache, JSX } from 'react';

import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { SiteFooter as FooterSection } from '~/lib/makeswift/components/site-footer/site-footer';

import { FooterFragment } from './fragment';
import { AmazonIcon } from './payment-icons/amazon';
import { AmericanExpressIcon } from './payment-icons/american-express';
import { ApplePayIcon } from './payment-icons/apple-pay';
import { MastercardIcon } from './payment-icons/mastercard';
import { PayPalIcon } from './payment-icons/paypal';
import { VisaIcon } from './payment-icons/visa';

const paymentIcons = [
  <AmazonIcon key="amazon" />,
  <AmericanExpressIcon key="americanExpress" />,
  <ApplePayIcon key="apple" />,
  <MastercardIcon key="mastercard" />,
  <PayPalIcon key="paypal" />,
  <VisaIcon key="visa" />,
];

// Social media icons mapping
const socialIcons: Record<string, { icon: JSX.Element }> = {
  Facebook: { icon: <SiFacebook title="Facebook" /> },
  Twitter: { icon: <SiX title="Twitter" /> },
  X: { icon: <SiX title="X" /> },
  Pinterest: { icon: <SiPinterest title="Pinterest" /> },
  Instagram: { icon: <SiInstagram title="Instagram" /> },
  YouTube: { icon: <SiYoutube title="YouTube" /> },
  LinkedIn: { icon: <SiLinkerd title="LinkedIn" /> }, // Using X icon as placeholder
};

const getLayoutData = cache(async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return readFragment(FooterFragment, response).site;
});

const getContactInformation = async () => {
  const data = await getLayoutData();

  if (!data.settings?.contact) {
    return null;
  }

  return {
    address: data.settings.contact.address,
    phone: data.settings.contact.phone,
  };
};

const getCopyright = async () => {
  const data = await getLayoutData();

  if (!data.settings) {
    return null;
  }

  return `© ${new Date().getFullYear()} ${data.settings.storeName} – Powered by BigCommerce`;
};

const getLogo = async () => {
  const data = await getLayoutData();

  if (!data.settings) {
    return null;
  }

  return logoTransformer(data.settings);
};

const getSections = async () => {
  const data = await getLayoutData();

  return [
    {
      title: 'Categories',
      links: data.categoryTree.map((category) => ({
        label: category.name,
        href: category.path,
      })),
    },
    {
      title: 'Brands',
      links: removeEdgesAndNodes(data.brands).map((brand) => ({
        label: brand.name,
        href: brand.path,
      })),
    },
    {
      title: 'Navigate',
      links: removeEdgesAndNodes(data.content.pages).map((page) => ({
        label: page.name,
        href: page.__typename === 'ExternalLinkPage' ? page.link : page.path,
      })),
    },
  ];
};

const getSocialMediaLinks = async () => {
  const data = await getLayoutData();

  if (!data.settings?.socialMediaLinks) {
    return null;
  }

  return data.settings.socialMediaLinks
    .filter((socialMediaLink) => Boolean(socialIcons[socialMediaLink.name]))
    .map((socialMediaLink) => ({
      href: socialMediaLink.url,
      icon: socialIcons[socialMediaLink.name]?.icon,
    }));
};

export const Footer = () => {
  const t = useTranslations('Components.Footer');

  return (
    <FooterSection
      contactInformation={getContactInformation()}
      contactTitle={t('contact')}
      copyright={getCopyright()}
      logo={getLogo()}
      logoHref="/"
      logoLabel={t('home')}
      paymentIcons={paymentIcons}
      sections={getSections()}
      socialMediaLinks={getSocialMediaLinks()}
    />
  );
};

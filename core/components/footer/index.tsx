import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import {
  SiFacebook,
  SiInstagram,
  SiPinterest,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import { getTranslations } from 'next-intl/server';
import PLazy from 'p-lazy';
import { JSX } from 'react';

import { Footer as FooterSection } from '@/vibes/soul/sections/footer';
import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { logoTransformer } from '~/data-transformers/logo-transformer';

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

const socialIcons: Record<string, { icon: JSX.Element }> = {
  Facebook: { icon: <SiFacebook title="Facebook" /> },
  Twitter: { icon: <SiX title="Twitter" /> },
  X: { icon: <SiX title="X" /> },
  Pinterest: { icon: <SiPinterest title="Pinterest" /> },
  Instagram: { icon: <SiInstagram title="Instagram" /> },
  YouTube: { icon: <SiYoutube title="YouTube" /> },
};

const GetSectionsQuery = graphql(`
  query GetSectionsQuery {
    site {
      content {
        pages(filters: { parentEntityIds: [0] }) {
          edges {
            node {
              __typename
              name
              ... on RawHtmlPage {
                path
              }
              ... on ContactPage {
                path
              }
              ... on NormalPage {
                path
              }
              ... on BlogIndexPage {
                path
              }
              ... on ExternalLinkPage {
                link
              }
            }
          }
        }
      }
      brands(first: 5) {
        edges {
          node {
            entityId
            name
            path
          }
        }
      }
      categoryTree {
        name
        path
      }
    }
  }
`);

const getSections = async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: GetSectionsQuery,
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return [
    {
      title: 'Categories',
      links: data.site.categoryTree.map((category) => ({
        label: category.name,
        href: category.path,
      })),
    },
    {
      title: 'Brands',
      links: removeEdgesAndNodes(data.site.brands).map((brand) => ({
        label: brand.name,
        href: brand.path,
      })),
    },
    {
      title: 'Navigate',
      links: removeEdgesAndNodes(data.site.content.pages).map((page) => ({
        label: page.name,
        href: page.__typename === 'ExternalLinkPage' ? page.link : page.path,
      })),
    },
  ];
};

export const Footer = async () => {
  const t = await getTranslations('Components.Footer');

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: { next: { revalidate } },
  });

  const data = readFragment(FooterFragment, response).site;

  const contactInformation = data.settings?.contact
    ? {
        address: data.settings.contact.address,
        phone: data.settings.contact.phone,
      }
    : null;

  const logo = data.settings ? logoTransformer(data.settings) : '';

  const socialMediaLinks = data.settings?.socialMediaLinks
    ? data.settings.socialMediaLinks
        .filter((socialMediaLink) => Boolean(socialIcons[socialMediaLink.name]))
        .map((socialMediaLink) => ({
          href: socialMediaLink.url,
          icon: socialIcons[socialMediaLink.name]?.icon,
        }))
    : null;

  const copyright = `© ${new Date().getFullYear()} ${data.settings?.storeName} – Powered by BigCommerce`;

  return (
    <FooterSection
      contactInformation={contactInformation}
      contactTitle={t('contact')}
      copyright={copyright}
      logo={logo}
      logoHref="/"
      logoLabel={t('home')}
      paymentIcons={paymentIcons}
      sections={PLazy.from(getSections)}
      socialMediaLinks={socialMediaLinks}
    />
  );
};

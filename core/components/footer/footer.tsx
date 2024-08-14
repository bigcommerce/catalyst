import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import {
  SiFacebook,
  SiInstagram,
  SiLinkedin,
  SiPinterest,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';

import { FragmentOf, graphql } from '~/client/graphql';
import { Footer as ComponentsFooter } from '~/components/ui/footer';
import { logoTransformer } from '~/data-transformers/logo-transformer';

import { AmazonIcon } from './payment-icons/amazon';
import { AmericanExpressIcon } from './payment-icons/american-express';
import { ApplePayIcon } from './payment-icons/apple-pay';
import { MastercardIcon } from './payment-icons/mastercard';
import { PayPalIcon } from './payment-icons/paypal';
import { VisaIcon } from './payment-icons/visa';

export const FooterFragment = graphql(`
  fragment FooterFragment on Site {
    settings {
      storeName
      contact {
        address
        phone
      }
      socialMediaLinks {
        name
        url
      }
      logoV2 {
        __typename
        ... on StoreTextLogo {
          text
        }
        ... on StoreImageLogo {
          image {
            url: urlTemplate
            altText
          }
        }
      }
    }
    content {
      pages(filters: { isVisibleInNavigation: true }) {
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
`);

const socialIcons: Record<string, { icon: JSX.Element }> = {
  Facebook: { icon: <SiFacebook title="Facebook" /> },
  Twitter: { icon: <SiX title="Twitter" /> },
  X: { icon: <SiX title="X" /> },
  Pinterest: { icon: <SiPinterest title="Pinterest" /> },
  Instagram: { icon: <SiInstagram title="Instagram" /> },
  LinkedIn: { icon: <SiLinkedin title="LinkedIn" /> },
  YouTube: { icon: <SiYoutube title="YouTube" /> },
};

interface Props {
  data: FragmentOf<typeof FooterFragment>;
}

export const Footer = ({ data }: Props) => {
  const sections = [
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

  return (
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
      socialMediaLinks={data.settings?.socialMediaLinks
        .filter((socialMediaLink) => Boolean(socialIcons[socialMediaLink.name]))
        .map((socialMediaLink) => ({
          href: socialMediaLink.url,
          icon: socialIcons[socialMediaLink.name]?.icon,
        }))}
    />
  );
};

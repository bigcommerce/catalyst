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

import { StoreLogo, StoreLogoFragment } from '../store-logo';

import { Copyright, CopyrightFragment } from './copyright';
import { Locale } from './locale';
import { PaymentMethods } from './payment-methods';

export const FooterFragment = graphql(
  `
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
        ...CopyrightFragment
        ...StoreLogoFragment
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
  `,
  [CopyrightFragment, StoreLogoFragment],
);

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
  const items = [
    {
      title: 'Categories',
      links: data.categoryTree.map((category) => ({
        name: category.name,
        path: category.path,
      })),
    },
    {
      title: 'Brands',
      links: removeEdgesAndNodes(data.brands).map((brand) => ({
        name: brand.name,
        path: brand.path,
      })),
    },
    {
      title: 'Navigate',
      links: removeEdgesAndNodes(data.content.pages).map((page) => ({
        name: page.name,
        path: page.__typename === 'ExternalLinkPage' ? page.link : page.path,
      })),
    },
  ];

  return (
    <ComponentsFooter
      contactInformation={data.settings?.contact}
      items={items}
      logo={data.settings ? <StoreLogo data={data.settings} /> : null}
      socialMediaLinks={data.settings?.socialMediaLinks
        .filter((socialMediaLink) => Boolean(socialIcons[socialMediaLink.name]))
        .map((socialMediaLink) => ({
          name: socialMediaLink.name,
          url: socialMediaLink.url,
          icon: socialIcons[socialMediaLink.name]?.icon,
        }))}
    >
      <section className="flex flex-col gap-10 border-t border-gray-200 px-4 py-8 sm:gap-8 sm:px-10 sm:py-6 lg:hidden lg:px-12 2xl:px-0">
        <Locale />

        <div className="flex w-full flex-col justify-between gap-10 sm:flex-row sm:gap-8">
          <PaymentMethods />
          {data.settings && <Copyright data={data.settings} />}
        </div>
      </section>

      <section className="hidden justify-between gap-8 border-t border-gray-200 px-4 py-6 sm:px-10 lg:flex lg:px-12 2xl:px-0">
        {data.settings && <Copyright data={data.settings} />}
        <div className="flex gap-8">
          <Locale />
          <PaymentMethods />
        </div>
      </section>
    </ComponentsFooter>
  );
};

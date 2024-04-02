import { FragmentOf, graphql } from '~/client/graphql';

import { BcImage } from '../bc-image';

export const StoreLogoFragment = graphql(`
  fragment StoreLogoFragment on Settings {
    storeName
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
`);

interface Props {
  data: FragmentOf<typeof StoreLogoFragment>;
}

export const StoreLogo = ({ data }: Props) => {
  const { logoV2: logo, storeName } = data;

  if (logo.__typename === 'StoreTextLogo') {
    return <span className="text-2xl font-black">{logo.text}</span>;
  }

  return (
    <BcImage
      alt={logo.image.altText ? logo.image.altText : storeName}
      className="max-h-16 object-contain"
      height={32}
      priority
      src={logo.image.url}
      width={155}
    />
  );
};

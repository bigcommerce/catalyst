import { FragmentOf } from '~/client/graphql';

import { BcImage } from '../bc-image';

import { StoreLogoFragment } from './fragment';

interface Props {
  data: FragmentOf<typeof StoreLogoFragment>;
}

export const StoreLogo = ({ data }: Props) => {
  const { logoV2: logo, storeName } = data;

  if (logo.__typename === 'StoreTextLogo') {
    return <span className="truncate text-2xl font-black">{logo.text}</span>;
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

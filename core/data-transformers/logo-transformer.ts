import { ResultOf } from 'gql.tada';

import { StoreLogoFragment } from '~/components/store-logo/fragment';

export const logoTransformer = (data: ResultOf<typeof StoreLogoFragment>) => {
  const { logoV2: logo } = data;

  if (logo.__typename === 'StoreTextLogo') {
    return logo.text;
  }

  return { src: logo.image.url, altText: logo.image.altText };
};

import { graphql } from '~/client/graphql';
import { FooterFragment } from '~/components/footer/fragment';
import { HeaderFragment } from '~/components/header/fragment';

export const LayoutQuery = graphql(
  `
    query LayoutQuery {
      site {
        ...HeaderFragment
        ...FooterFragment
      }
    }
  `,
  [HeaderFragment, FooterFragment],
);

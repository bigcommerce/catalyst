import { graphql } from '~/client/graphql';

export const SharingLinksFragment = graphql(`
  fragment SharingLinksFragment on BlogPost {
    entityId
    thumbnailImage {
      url: urlTemplate
    }
    seo {
      pageTitle
    }
  }
`);

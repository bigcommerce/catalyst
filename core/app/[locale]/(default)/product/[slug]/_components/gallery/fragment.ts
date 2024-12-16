import { graphql } from '~/client/graphql';

export const GalleryFragment = graphql(`
  fragment GalleryFragment on Product {
    images(first: 50) {
      # Increased limit to fetch all images
      edges {
        node {
          altText
          url: urlTemplate(lossy: true)
          isDefault
        }
      }
    }
    defaultImage {
      altText
      url: urlTemplate(lossy: true)
    }
    videos {
      edges {
        node {
          title
          url
        }
      }
    }
  }
`);
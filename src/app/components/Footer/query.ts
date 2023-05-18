import { graphql } from '@/lib/gql';

export const getStoreNameQuery = graphql(`
  query getStoreName {
    site {
      settings {
        storeName
      }
    }
  }
`);

export const getSocialIconsQuery = graphql(`
  query getSocialIcons {
    site {
      settings {
        socialMediaLinks {
          name
          url
        }
      }
    }
  }
`);

export const getContactInformationQuery = graphql(`
  query getContactInformation {
    site {
      settings {
        contact {
          address
          phone
        }
      }
    }
  }
`);

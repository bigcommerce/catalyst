import { graphql } from '~/client/graphql';

export const ScriptsFragment = graphql(`
  fragment ScriptsFragment on Content {
    scripts(first: 50, filters: { visibilities: [ALL_PAGES, STOREFRONT] }) {
      edges {
        node {
          __typename
          integrityHashes {
            hash
          }
          entityId
          consentCategory
          visibility
          ... on InlineScript {
            scriptTag
          }
          ... on SrcScript {
            src
          }
        }
      }
    }
  }
`);

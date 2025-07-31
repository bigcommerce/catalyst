import { graphql } from '~/client/graphql';

export const ScriptsFragment = graphql(`
  fragment ScriptsFragment on Content {
    headerScripts: scripts(
      first: 50
      filters: { visibilities: [ALL_PAGES, STOREFRONT], location: HEAD }
    ) {
      ...ScriptTypeConnectionFragment
    }
    footerScripts: scripts(
      first: 50
      filters: { visibilities: [ALL_PAGES, STOREFRONT], location: FOOTER }
    ) {
      ...ScriptTypeConnectionFragment
    }
  }

  fragment ScriptTypeConnectionFragment on ScriptTypeConnection {
    edges {
      node {
        __typename
        integrityHashes {
          hash
        }
        entityId
        consentCategory
        location
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
`);

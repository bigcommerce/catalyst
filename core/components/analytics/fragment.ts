import { graphql } from '~/client/graphql';

export const WebAnalyticsFragment = graphql(`
  fragment WebAnalyticsFragment on Settings {
    webAnalytics {
      ga4 {
        tagId
      }
    }
  }
`);

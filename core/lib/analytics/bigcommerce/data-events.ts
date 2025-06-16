import { client } from '~/client';
import { graphql } from '~/client/graphql';

const VisitStartedMutation = graphql(`
  mutation VisitStarted($input: VisitStartedEventInput!) {
    analytics {
      visitStartedEvent(input: $input) {
        executed
      }
    }
  }
`);

const ProductViewedMutation = graphql(`
  mutation ProductViewed($input: ProductViewedEventInput!) {
    analytics {
      productViewedEvent(input: $input) {
        executed
      }
    }
  }
`);

export interface AnalyticsInitiator {
  visitId: string;
  visitorId: string;
}

export interface AnalyticsRequest {
  url: string;
  refererUrl: string;
  userAgent: string;
}

export interface VisitStartedEvent {
  initiator: AnalyticsInitiator;
  request: AnalyticsRequest;
}

export interface ProductViewedEvent {
  initiator: AnalyticsInitiator;
  request: AnalyticsRequest;
  productId: number;
}

export async function sendVisitStartedEvent({ initiator, request }: VisitStartedEvent) {
  const input = { commonInput: preareCommonInput(initiator, request) };

  return client.fetch({
    document: VisitStartedMutation,
    variables: { input },
    fetchOptions: { cache: 'no-store' },
  });
}

export async function sendProductViewedEvent({
  productId,
  initiator,
  request,
}: ProductViewedEvent) {
  const input = {
    commonInput: preareCommonInput(initiator, request),
    productInput: { productEntityId: Number(productId) },
  };

  return await client.fetch({
    document: ProductViewedMutation,
    variables: { input },
    fetchOptions: { cache: 'no-store' },
  });
}

function preareCommonInput(initiator: AnalyticsInitiator, request: AnalyticsRequest) {
  return {
    initiator,
    request: {
      url: request.url,
      refererUrl: request.refererUrl,
      userAgent: request.userAgent,
    },
  };
}

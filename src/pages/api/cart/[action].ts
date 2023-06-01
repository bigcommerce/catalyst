import { getIronSession } from 'iron-session/edge';
import { NextRequest, NextResponse } from 'next/server';

import {
  addCartLineItemMutation,
  createCartMutation,
  deleteCartLineItemMutation,
  deleteCartMutation,
} from '../../../components/cart/mutations';
import { getCartIdQuery, getCartQuery } from '../../../components/cart/queries';
import { getServerClient } from '../../../graphql/server';
import { sessionOptions } from '../../../session';

interface ActionObj {
  gql: object;
  getVariables: (arg: unknown) => object;
  onComplete?: (arg: unknown) => void;
}

const getCartId = () => 'be7efbcf-599b-401c-a6f7-cda696908f0a';

const QUERIES: {
  [key: string]: ActionObj;
} = {
  getCartQuery: {
    gql: getCartQuery,
    getVariables: () => ({
      entityId: getCartId(),
    }),
    onComplete: () => {
      // delete cartId from route
    },
  },
};

const MUTATIONS: {
  [key: string]: ActionObj;
} = {
  addCartLineItemMutation: {
    gql: addCartLineItemMutation,
    getVariables: (body) => ({
      addCartLineItemsInput: {
        cartEntityId: getCartId(),
        data: {
          lineItems: [body],
        },
      },
    }),
  },
  createCartMutation: {
    gql: createCartMutation,
    getVariables: (body) => ({
      createCartInput: {
        lineItems: [body],
      },
    }),
  },
  deleteCartMutation: {
    gql: deleteCartMutation,
    getVariables: () => ({
      deleteCartInput: {
        cartEntityId: getCartId(),
      },
    }),
    onComplete: () => {
      // delete cartId from route
    },
  },
  deleteCartLineItemMutation: {
    gql: deleteCartLineItemMutation,
    getVariables: ({ lineItemEntityId }) => ({
      deleteCartLineItemInput: {
        cartEntityId: getCartId(),
        lineItemEntityId,
      },
    }),
  },
};

export default async function cart(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  const actionObj = QUERIES[action] || MUTATIONS[action];

  if (!actionObj) {
    return new NextResponse(
      JSON.stringify({
        data: {
          error: 'Error: Query/Mutation not found.',
        },
      }),
      { status: 404 },
    );
  }

  const { gql, getVariables, onComplete } = actionObj;
  const actionType = gql.definitions.find((def) => !!def.operation)?.operation;

  const body: unknown = await req.json();
  const client = getServerClient();

  const res = NextResponse.redirect(new URL('/', req.url), 302);
  const session = await getIronSession(req, res, sessionOptions);

  if (!session.cartId) {
    const cartId = await client.query({ query: getCartIdQuery });
    // save cartId in session
  }

  if (actionType === 'mutation') {
    const variables = getVariables(body);
    const response = await client.mutate({ mutation: gql, variables });

    if (onComplete) {
      onComplete();
    }

    return res;
  } else if (actionType === 'query') {
    const variables = getVariables();
    const response = await client.query({ query: gql, variables });

    if (onComplete) {
      onComplete();
    }

    return res;
  }

  return new NextResponse(
    JSON.stringify({
      data: {
        error: 'Something went wrong...',
      },
    }),
    { status: 400 },
  );
}

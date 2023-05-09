import { getIronSession } from 'iron-session/edge';
import { NextRequest, NextResponse } from 'next/server';

import {
  addCartLineItemMutation,
  createCartMutation,
  deleteCartLineItemMutation,
  deleteCartMutation,
} from '../../../components/cart/mutations';
import { getCartQuery } from '../../../components/cart/queries';
import { getServerClient } from '../../../graphql/server';
import { sessionOptions } from '../../../session';

const getCartId = () => '80ad4662-f569-4c83-bca2-cea6702ad9e4';
const getCartId2 = async (req, res) => {
  const session = await getIronSession(req, res, sessionOptions);

  return session.cartId;
};

const QUERIES = {
  getCartQuery: {
    gql: getCartQuery,
    getVariables: () => ({
      entityId: getCartId(),
    }),
  },
};

const MUTATIONS = {
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

  const { gql, getVariables } = actionObj;

  const actionType = gql.definitions.find((def) => !!def.operation)?.operation;

  const body: unknown = await req.json();
  const client = getServerClient();

  const res = NextResponse.next();
  const session = await getIronSession(req, res, sessionOptions);

  console.log(session, 'session in route 1');

  if (!session.cartId) {
    session.cartId = '9ca6a993-6f59-4be6-a9ec-5cbb5a845167';
    await session.save();
  }

  console.log(session, 'session in route 2');

  if (actionType === 'mutation') {
    const variables = getVariables(body);
    const response = await client.mutate({ mutation: gql, variables });

    return new NextResponse(JSON.stringify(response));
  } else if (actionType === 'query') {
    const variables = getVariables();
    const response = await client.query({ query: gql, variables });

    return new NextResponse(JSON.stringify(response));
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

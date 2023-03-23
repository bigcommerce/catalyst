import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';

import { cartCreated, sessionOptions } from '../../session';

export const config = {
  runtime: 'nodejs',
};

export default withIronSessionApiRoute(handler, sessionOptions);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cartId = 'some-cart-id';

  await cartCreated(req.session, cartId);

  res.status(200).json({ cartId });
}

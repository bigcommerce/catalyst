'use server';

import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { JWEInvalid, JWSInvalid, JWTInvalid } from 'jose/errors';
import { cookies } from 'next/headers';

interface CartJwt extends JWTPayload {
  cartId: string;
}

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cartIdJwt = cookieStore.get('cartId')?.value;

  if (!cartIdJwt) {
    return;
  }

  try {
    const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET);
    const verifiedJwt = await jwtVerify<CartJwt>(cartIdJwt, secretKey, {
      algorithms: ['HS256'],
      typ: 'JWT',
    });

    return verifiedJwt.payload.cartId;
  } catch (error) {
    // Backwards compatibility with the old cartId cookie:
    // If the JWT is invalid, set the cart cookie to a signed JWT
    // and use the old unencoded cartId value for just the next read.
    if (error instanceof JWSInvalid || error instanceof JWTInvalid || error instanceof JWEInvalid) {
      await setCartId(cartIdJwt);

      return cartIdJwt;
    }

    throw error;
  }
}

export async function setCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET);

  const cartJwt = await new SignJWT({ cartId })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secretKey);

  cookieStore.set('cartId', cartJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearCartId(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete('cartId');
}

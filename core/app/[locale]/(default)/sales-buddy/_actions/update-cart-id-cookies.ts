'use server';
import { cookies } from 'next/headers';

export const getReferralIdCookie = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('referralId');
};

export const UpdateCartIdCookie = async (cartId) => {
  const cookieStore = await cookies();
  // const hasCookie = cookieStore.has('referralId')
  cookieStore.set({
    name: 'cartId',
    value: cartId,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });
  cookieStore.set({
    name: 'inputCheck',
    value: 'true',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });
};
export const retriveInputCheckCookie = async () => {
  const cookieStore = await cookies();
  const inputCheckCookie = cookieStore.get('inputCheck');
  return inputCheckCookie ? inputCheckCookie.value : null;
};
export const removeInputCheckCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('inputCheck');
};
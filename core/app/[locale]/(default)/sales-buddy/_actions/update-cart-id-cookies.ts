'use server';
import { cookies } from 'next/headers';

export const getReferralIdCookie = async () => {
    const cookieStore = await cookies();
    return cookieStore.get('referralId');
}

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
}
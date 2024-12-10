'use server';
import { cookies } from 'next/headers';

export const getReferrerIdCookie = async () => {
    const cookieStore = await cookies();
    return cookieStore.get('referrerId');
}
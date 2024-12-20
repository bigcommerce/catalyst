'use server';
import { cookies } from 'next/headers';

export const getCartIdCookie = async () => {
    const cookieStore = await cookies();
    const hasCookie = cookieStore.has('cartId');
    let returnFlag=false;
    if (hasCookie) {
        returnFlag = true;
    }
    return returnFlag;
}

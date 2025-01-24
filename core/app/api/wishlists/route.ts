// app/api/wishlists/route.ts
import { NextResponse } from 'next/server';
import { getWishlists } from '~/app/[locale]/(default)/account/(tabs)/wishlists/page-data';

export async function GET() {
  try {
    const data = await getWishlists({
      limit: 50,
    });

    return NextResponse.json(data || { wishlists: [] });
  } catch (error) {
    console.error('Error in wishlists API:', error);
    return NextResponse.json({ wishlists: [] });
  }
}
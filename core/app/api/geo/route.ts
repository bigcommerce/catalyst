import { geolocation } from '@vercel/functions';
import { NextRequest, NextResponse } from 'next/server';
 
export const GET = async (request: NextRequest) => {
  const locationDetails = geolocation(request);
  return NextResponse.json(locationDetails);
}

export const runtime = 'edge';
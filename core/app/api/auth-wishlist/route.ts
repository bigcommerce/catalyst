import { getSessionCustomerAccessToken, getSessionUserDetails } from '~/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const userDetails = await getSessionUserDetails();
    const isAuthenticated = !!customerAccessToken;

    if (isAuthenticated && userDetails?.user?.name) {
      return NextResponse.json({
        isAuthenticated: true,
        user: userDetails.user,
        message: 'User is authenticated',
      });
    } else {
      return NextResponse.json({
        isAuthenticated: false,
        user: null,
        message: 'Guest user detected',
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        isAuthenticated: false,
        user: null,
        message: 'Authentication check failed',
      },
      { status: 500 },
    );
  }
}

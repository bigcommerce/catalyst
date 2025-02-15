import braintree from 'braintree';
import { NextRequest, NextResponse } from 'next/server';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID!,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
});

export async function GET(req: NextRequest) {
  try {
    const response = await gateway.clientToken.generate({
        // merchantAccountId: process.env.BRAINTREE_MERCHANT_ID,
      });
    console.log('Generated client token:', response.clientToken);
    return NextResponse.json({ clientToken: response.clientToken });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate client token' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nonce, amount } = await request.json();
    
    const result = await gateway.transaction.sale({
        amount: amount,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: false
        }
      });
  
      if (result.success) {
        return NextResponse.json({
          success: true,
          transaction: {
            id: result.transaction.id,
            status: result.transaction.status
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          error: result.message
        }, { status: 400 });
      }
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
}
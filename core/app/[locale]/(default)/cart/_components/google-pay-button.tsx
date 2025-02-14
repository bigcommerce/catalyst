'use client';
import GooglePayButton from '@google-pay/button-react';
import React, { useEffect, useState } from 'react';
import Script from 'next/script';

export default function GooglePayBtn() {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientToken = async () => {
      try {
        const response = await fetch('/api/cart-payment');
        const data = await response.json();
        setClientToken(data.clientToken);
      } catch (err) {}
    };

    fetchClientToken();
  }, []);

  const handleLoadPaymentData = async (paymentData: any) => {
    try {
        const nonce = paymentData.paymentMethodData.tokenizationData.token;
        
        if (typeof nonce === 'string') {
          const response = await fetch('/api/cart-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nonce,
              amount: '10.00'
            })
          });
          
          const result = await response.json();
        } 
      } catch (error: any) {
        // console.error('Error processing payment:', error);
        setError(error.message);
      }
  };

  if (!clientToken) {
    return <p>Loading...</p>;
  }

  return (
    <>
    <Script src='https://pay.google.com/gp/p/js/pay.js' strategy="afterInteractive" />
    <GooglePayButton
      environment="TEST"
      paymentRequest={{
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA'],
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'braintree',
                'braintree:apiVersion': 'v1',
                'braintree:sdkVersion': '3.28.0',
                'braintree:merchantId': process.env.NEXT_PUBLIC_MERCHANT_ID || '',
                'braintree:clientKey': clientToken,
                // 'braintree:authorizationFingerprint': clientToken!,
              },
            },
          },
        ],
        merchantInfo: {
          merchantId: process.env.NEXT_PUBLIC_MERCHANT_ID || '',  // Use the actual merchant ID here
          merchantName: 'Belami-eCommerce',
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPriceLabel: 'Total',
          totalPrice: '10.00',
          currencyCode: 'USD',
          countryCode: 'US',
        },
      }}
      onLoadPaymentData={handleLoadPaymentData}
      onError={(error:any) => {
        // console.error('Google Pay Error:', error);
        setError(error.message);
      }}
      onCancel={() => console.log('Payment cancelled')}
      existingPaymentMethodRequired={false}
    />
    </>
  );
}
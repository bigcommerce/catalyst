import Script from 'next/script';

export function KlaviyoJS() {
  const klaviyoPublicKey = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY;

  if (!klaviyoPublicKey) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Klaviyo] WARNING: NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY is not set, no data will be sent to Klaviyo',
    );

    return null;
  }

  return (
    <Script src={`//static.klaviyo.com/onsite/js/klaviyo.js?company_id=${klaviyoPublicKey}`} />
  );
}
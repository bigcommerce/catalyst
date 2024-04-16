import Script from 'next/script';

export default function Bodl() {
  return (
    <Script
      id="bodl-events"
      src="https://microapps.bigcommerce.com/bodl-events/index.js"
      strategy="lazyOnload"
    />
  );
}

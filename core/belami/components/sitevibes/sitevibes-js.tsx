import Script from 'next/script';

export function SiteVibesJS() {
  return (
    <Script
        id="sv-pixel-script"
        src="https://app.sitevibes.com/js/pixel.js?key=e0feae51-26fd-453a-8e67-f9a1a74c8d69"
        strategy="afterInteractive"
      />
  );
}
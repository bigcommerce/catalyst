import { headers } from 'next/headers';
import Script from 'next/script';
import { userAgent } from 'next/server';

function checkBrowserSupport(name: string | undefined, version: string | undefined): boolean {
  if (!name || !version) return false;

  const versionNumber = parseFloat(version);

  switch (name) {
    case 'Chrome':
      return versionNumber <= 105;

    case 'Edge':
      return versionNumber <= 105;

    case 'Safari':
      return versionNumber <= 15.6;

    case 'Firefox':
      return versionNumber <= 109;

    default:
      return false;
  }
}

export async function ContainerQueryPolyfill() {
  const headersList = await headers();
  const { browser } = userAgent({ headers: headersList });

  const { version, name } = browser;

  const isUnsupported = checkBrowserSupport(name, version);

  if (isUnsupported) {
    return (
      // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
      <Script
        src="https://cdn.jsdelivr.net/npm/container-query-polyfill@1/dist/container-query-polyfill.modern.js"
        strategy="beforeInteractive"
      />
    );
  }
}

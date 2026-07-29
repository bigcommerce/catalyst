import { getSiteVersion } from '@makeswift/runtime/next/server';
import { clsx } from 'clsx';

import '../globals.css';

import { fonts } from '~/app/fonts';
import { SiteTheme } from '~/lib/makeswift/components/site-theme';
import { MakeswiftProvider } from '~/lib/makeswift/provider';

import '~/lib/makeswift/components';

// Renders for non-localized requests that don't match any route (e.g. /unknown.txt)
// or when app/[locale]/layout.tsx calls notFound() for an invalid locale. Since
// app/layout.tsx is a passthrough, this page must own its own <html>/<body>.
export default async function RootNotFound() {
  const siteVersion = await getSiteVersion();

  return (
    <MakeswiftProvider siteVersion={siteVersion}>
      <html className={clsx(fonts.map((f) => f.variable))} lang="en">
        <head>
          <SiteTheme />
        </head>
        <body className="flex min-h-screen flex-col">
          <main className="flex flex-1 items-center justify-center font-[family-name:var(--not-found-font-family,var(--font-family-body))]">
            <div className="mx-auto w-full max-w-screen-2xl px-3 py-10 @container @xl:px-6 @4xl:px-20">
              <header className="text-center">
                <h1 className="mb-3 font-[family-name:var(--not-found-title-font-family,var(--font-family-heading))] text-3xl font-medium leading-none text-[var(--not-found-title,hsl(var(--foreground)))] @xl:text-4xl @4xl:text-5xl">
                  Not found
                </h1>
                <p className="mb-4 text-lg text-[var(--not-found-subtitle,hsl(var(--contrast-500)))]">
                  The page you are looking for could not be found.
                </p>
                <a
                  className="relative z-0 inline-flex min-h-14 select-none items-center justify-center gap-x-3 overflow-hidden rounded-full border border-[var(--button-primary-border,hsl(var(--primary)))] bg-[var(--button-primary-background,hsl(var(--primary)))] px-6 py-4 text-center font-[family-name:var(--button-font-family)] text-base font-semibold leading-normal text-[var(--button-primary-text)] after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:rounded-full after:bg-[var(--button-primary-background-hover,color-mix(in_oklab,hsl(var(--primary)),white_75%))] after:transition-[opacity,transform] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] hover:after:translate-x-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus,hsl(var(--primary)))] focus-visible:ring-offset-2"
                  href="/"
                >
                  <span>Go to homepage</span>
                </a>
              </header>
            </div>
          </main>
        </body>
      </html>
    </MakeswiftProvider>
  );
}

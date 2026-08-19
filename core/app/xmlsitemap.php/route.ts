/* eslint-disable check-file/folder-naming-convention */
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { permanentRedirect } from 'next/navigation';

/*
 * This route is used to redirect the legacy Stencil sitemap that lives on /xmlsitemap.php
 * to Catalyst's new location on /sitemap.xml
 * This is for the benefit of websites who already have a sitemap submitted to Webmaster Tools
 * on /xmlsitemap.php
 */

export const GET = () => {
  // Deliberately not the locale-aware redirect: /sitemap.xml is excluded from the proxy matcher, so
  // it is not a localized route. Prefixing it would point at /<locale>/sitemap.xml, which 404s
  // whenever every locale carries a prefix.
  permanentRedirect('/sitemap.xml');
};

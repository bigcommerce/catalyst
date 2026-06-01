import { contentAssetUrl } from '~/lib/store-assets';

// The Control Panel WYSIWYG editor stores uploaded images/files as root-relative
// `/content/...` paths. These resolve on a same-domain Stencil storefront but 404 on the
// headless Catalyst domain. Rewrite them to absolute BigCommerce CDN URLs.
const CONTENT_URL_REGEX = /(src|href)=("|')\/content\/([^"']*)\2/gi;

export function rewriteWysiwygContentUrls(html: string): string {
  return html.replace(
    CONTENT_URL_REGEX,
    (_match, attr: string, quote: string, path: string) =>
      `${attr}=${quote}${contentAssetUrl(path)}${quote}`,
  );
}

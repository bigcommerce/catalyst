import { cdnAssetUrl } from '~/lib/store-assets';

// The Control Panel WYSIWYG editor stores uploaded images/files as store-root-relative WebDAV
// paths — `/content/...` for content uploads and `/product_images/...` for image-manager
// uploads. These resolve on a same-domain Stencil storefront but 404 on the headless Catalyst
// domain. Rewrite them to absolute BigCommerce CDN URLs. Scoped to known WebDAV asset folders
// so internal page links are left untouched.
const WEBDAV_ASSET_URL_REGEX = /(src|href)=("|')(\/(?:content|product_images)\/[^"']*)\2/gi;

export function rewriteWysiwygContentUrls(html: string): string {
  return html.replace(
    WEBDAV_ASSET_URL_REGEX,
    (_match, attr: string, quote: string, path: string) =>
      `${attr}=${quote}${cdnAssetUrl(path)}${quote}`,
  );
}

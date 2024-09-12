/* eslint-disable check-file/folder-naming-convention */
import { permanentRedirect } from '~/i18n/routing';

/*
 * This route is used to redirect the legacy Stencil sitemap that lives on /xmlsitemap.php
 * to Catalyst's new location on /sitemap.xml
 * This is for the benefit of websites who already have a sitemap submitted to Webmaster Tools
 * on /xmlsitemap.php
 */

export const GET = () => permanentRedirect('/sitemap.xml');

export const runtime = 'edge';

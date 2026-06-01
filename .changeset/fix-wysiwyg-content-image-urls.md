---
"@bigcommerce/catalyst-core": patch
---

Fix broken images in WYSIWYG content (web pages, blog posts, product description and warranty). Images uploaded through the Control Panel editor are stored as root-relative `/content/...` paths that 404 on the headless storefront domain; they are now rewritten to absolute BigCommerce CDN URLs.

---
'@bigcommerce/catalyst': patch
---

`catalyst channels update --checkout-url` now checks that the checkout URL is serving a certificate, and warns if it isn't, so the command doesn't finish silently before checkout loads. On a native hosting deployment hostname (`c.<project>`), where setting the URL is what provisions the certificate, it waits for the certificate to be issued first.

---
'@bigcommerce/catalyst': patch
---

`catalyst channels update --checkout-url` now waits for the checkout hostname's certificate when it's on a native hosting deployment hostname (`c.<project>`), so the command doesn't finish before checkout loads. On your own domain, it checks once and warns if the domain isn't serving a certificate yet.

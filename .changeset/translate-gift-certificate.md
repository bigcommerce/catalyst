---
"@bigcommerce/catalyst-core": patch
---

TRAC-276 translate the gift certificate line item title in cart, order list, and order details. Previously the title was rendered as the raw English `"{amount} Gift Certificate"` string stored on the BigCommerce backend; it is now rendered from the existing `Cart.GiftCertificate.giftCertificate` translation key, with the amount shown in the separate price column (the order list view now populates `price`/`totalPrice` for gift certificates, which were previously empty).

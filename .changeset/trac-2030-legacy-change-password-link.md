---
"@bigcommerce/catalyst-core": patch
---

Fix the password reset email sent to customers flagged with "Request customer to set their password on next login". BigCommerce generates that link in the legacy Stencil format (`/login?action=change_password&c=<id>&t=<token>`), which the login page ignored. The login page now forwards it to `/change-password` so the customer can set a new password.

---
"@bigcommerce/catalyst": minor
---

Print the DNS records to publish when `catalyst domains add` succeeds. The A and CNAME values that point the domain at the project are shown with the success message, along with which to publish and a note that they are only returned when the domain is added. The records survive `--wait`, and are omitted when the API has none to share yet.

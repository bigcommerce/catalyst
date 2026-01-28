---
"@bigcommerce/catalyst-core": patch
---

Previously, users could fill out the review form and attempt to submit it without being logged in. They then received an error message saying they needed to be logged in. This would require them to leave the form to go to the login page which resulted in losing all entered information. They would then manually need to navigate back to the PDP.

To improve user experience, this PR implements a notification that informs users they must be logged in before being able to access the review form. This includes a link to the log in page which will handle redirecting the user back to the appropriate PDP after successful login.

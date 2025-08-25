---
"@bigcommerce/catalyst-core": minor
---

fix: implement maintenance mode using app router route handler

Replace NextResponse.rewrite with status (which doesn't work) with a proper route handler that returns 503 status code and renders maintenance page content matching the original MaintenanceSection component styling.
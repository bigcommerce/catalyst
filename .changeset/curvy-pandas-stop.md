---
"@bigcommerce/catalyst": patch
---

Remove the reading of default environment variable files.

## Migration

Ensure that environment variables are passed explicitly using flags if they are not already included in the `project.json` config file.

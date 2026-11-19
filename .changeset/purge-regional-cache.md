---
"@bigcommerce/catalyst": patch
---

Speed up cached page renders on Storefront Hosting. Tag lookups now stay cached for 10 minutes instead of 30 seconds, and `revalidateTag` and `revalidatePath` purge them in every data center. Rebuild and redeploy to pick it up.

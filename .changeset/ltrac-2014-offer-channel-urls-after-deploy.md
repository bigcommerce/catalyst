---
"@bigcommerce/catalyst": patch
---

After an interactive `catalyst deploy`, offer to point the channel at the deployment and to move its checkout onto the same domain (`c.<project>.<zone>`). Both questions default to No, and declining is remembered per channel in `.bigcommerce/project.json`. `catalyst channels update` makes the same checkout offer after changing a site URL. Nothing is asked without a terminal, in CI, or when `--update-site-url` or `--update-checkout-url` is passed.

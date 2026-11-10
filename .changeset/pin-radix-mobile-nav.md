---
'@bigcommerce/catalyst-core': patch
---

Fix the mobile navigation menu opening at zero width, with unclickable links, when an install resolves `@radix-ui/react-popover` above 1.1.14. The direct `@radix-ui/*` dependencies are now pinned to the tested versions, and the navigation's popover anchors render after their triggers.

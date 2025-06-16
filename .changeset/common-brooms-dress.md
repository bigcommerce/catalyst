---
"@bigcommerce/catalyst-core": patch
---

Adds Tailwind classes used to style the checkbox input and label based on the disabled state of the checkbox.

Migration:
Since this is a one-file change, you should be able to simply grab the diff from [this PR](https://github.com/bigcommerce/catalyst/pull/2399). The main changes to note are that we are [adding a `peer` class](https://v3.tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-sibling-state) to the CheckboxPrimitive.Root, explicitly styling the `enabled` pseudoclass, and only applying hover styles when the checkbox is enabled.

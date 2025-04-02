---
"@bigcommerce/catalyst-core": minor
---

Adds a new analytics provider meant to replace the other provider. This provider is built being framework agnostic but exposes a react provider to use within context. The initial implementation comes with a Google Analytics provider with some basic events to get started. We need to add some other events around starting checkout, banners, consent loading, and search. This change is additive only so no migration is needed until consumption.

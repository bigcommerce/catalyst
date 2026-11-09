---
'@bigcommerce/catalyst': patch
---

Fix the `--store-hash`, `--access-token` and `--project-uuid` help text, which said the values were read from `.env`. They are read from `CATALYST_STORE_HASH`, `CATALYST_ACCESS_TOKEN` and `CATALYST_PROJECT_UUID` in the shell, or from `.bigcommerce/project.json`. The `--env-path` help now says that CLI options are not read from the env file.

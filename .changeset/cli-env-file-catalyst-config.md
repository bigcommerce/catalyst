---
'@bigcommerce/catalyst': patch
---

`catalyst build` and `catalyst deploy` now read `CATALYST_PROJECT_UUID`, `CATALYST_STORE_HASH`, `CATALYST_ACCESS_TOKEN` and `CATALYST_API_HOST` from the env file (`--env-path`, or the auto-loaded `.env.local`/`.env`). Previously they were ignored, so `deploy --env-path <file>` deployed to the project in `.bigcommerce/project.json` instead of the one in the file. Flags still win over the env file.

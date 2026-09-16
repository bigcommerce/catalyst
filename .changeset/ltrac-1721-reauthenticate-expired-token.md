---
"@bigcommerce/catalyst": patch
---

Let `catalyst auth login` re-authenticate when the stored token has expired, instead of demanding an explicit `catalyst auth logout` first.

Every authenticated command answers a rejected token with "Your access token is invalid or has expired. Run `catalyst auth login` to re-authenticate." But `login` only checked whether credentials were *present*, not whether they still worked, so it replied "Already logged in to store X. Run `catalyst auth logout` first to re-authenticate." The two commands sent the user in a circle, and the only way out was to know to run `auth logout`.

`login` now verifies the credentials it finds before refusing. If they still work it reports the store and exits as before; if the API rejects them it says so and carries straight on to re-authentication.

A verification failure that isn't a rejection (API unreachable, 5xx) is treated as "couldn't tell" rather than "invalid": the credentials are kept and the command exits, since the device-code flow needs the same network that just failed and would only swap one error for another.

`catalyst auth login --store-hash <hash> --access-token <token>` also now does what it is documented to do. It was listed under "Login with existing credentials (skips interactive flow)", but that path never wrote the credentials anywhere — it reported "Already logged in" and exited, so nothing was stored and the next command was still unauthenticated. Passing both flags now verifies them and saves them to `.bigcommerce/project.json`, replacing whatever was there. Only the flags count: these options also read `CATALYST_STORE_HASH`/`CATALYST_ACCESS_TOKEN`, and an exported env var is ambient config that must not turn a plain `catalyst auth login` into a silent credential write. Rejected credentials are reported as rejected rather than silently ignored in favour of a browser login; unverifiable ones are stored with a warning.

Also adds `catalyst auth login --force` to skip the verification and re-authenticate (or store what was passed) outright.

---
name: verify-catalyst
description: Drive a Catalyst storefront in a real browser to prove a UI change works, and attach screenshot and video evidence to the pull request. Use when you change anything a shopper can see or do (pages, components, forms, cart, account, search), when asked to "verify", "show it working", "screenshot this", or "add evidence to the PR", and before marking a UI pull request ready for review. Works in the Catalyst monorepo and in any project created with `create catalyst` or forked from it.
license: MIT
compatibility: Requires Node.js 24+, the storefront's installed dependencies (including @playwright/test), and a BigCommerce store configured in .env.local. git and GitHub CLI 2.99.0+ (for `--attach`) are needed only to publish evidence; ffmpeg is optional (GIF/MP4). Runs on macOS, Linux, Windows, and WSL.
metadata:
  adapted-from: https://github.com/cursor/plugins/tree/main/pstack/skills/create-verification-skill
---

# Verify a Catalyst storefront

Prove a change by driving the real storefront the way a shopper would, then hand the reviewer the evidence: a recording, step screenshots, and a Playwright trace. Unit tests and type checks do not count as proof of UI behavior.

Everything goes through one helper, run from the **storefront directory** (the folder with `next.config.ts`):

- Catalyst monorepo: `core/`
- A project created with `create catalyst`, or a fork of one: the repository root

```sh
node .agents/skills/verify-catalyst/scripts/verify.mjs <command>
```

The helper is plain Node, so the same command works in bash, zsh, PowerShell, and cmd. Below, `verify` stands for that whole command.

## Rules

- **Exercise the real user path.** Click, type, and navigate as a shopper. Do not call server actions, set cookies, or hit internal routes to fake a state.
- **Capture the action and the result,** not only the final screen. A step's screenshot is taken _after_ its action, so name steps by what they prove.
- **Never hardcode store data.** Each store has its own catalog, categories, and settings. Discover product URLs, category names, and countries from the running store (`verify explore`), or read them from `.env.test.local` (`DEFAULT_PRODUCT_ID`, `TEST_CUSTOMER_EMAIL`, …).
- **Read-only by default.** The storefront talks to a live BigCommerce store. Do not submit orders, register customers, or write reviews unless the store is a sandbox and the change requires it. Stop before the final submit button when the visible result is enough. Treat `TESTS_READ_ONLY=true` in `.env.test.local` as a hard stop.
- **Never weaken a journey to make it pass.** If the store lacks a precondition (no product with variants, no country without states), report the run as blocked and name the missing data.
- **Never drive or stop a server you did not start.** Point `--url` at a developer's own server only when asked to.
- **Synthetic data only.** Everything you type into a form ends up in the recording. Use obviously fake values (`Test Shopper`, `test@example.com`, a made-up street address, `555` phone numbers) and never the developer's own name, email, address, or payment details. Credentials come only from `.env.test.local`. Look at the step screenshots before publishing; if one shows something that should not leave the machine, do not publish it.
- **Evidence is not secret-free by default.** Screenshots show the store's real catalog and prices. `publish` chooses where uploads go based on your access and the repository's visibility; see _Publish_. Evidence only ever goes to the repository that owns the PR, so a private storefront's PR never posts to a public repository.

## 1. Doctor

```sh
verify doctor
```

This read-only check covers Node, dependencies, `.env.local` keys (names only, never values), Makeswift config, Chromium, ffmpeg, the GitHub CLI, and whether the target URL serves Catalyst (`<meta name="platform" content="bigcommerce.catalyst">`). Fix every `FAIL` before going on, and run it again whenever something looks wrong.

Common fixes:

| FAIL                                   | Fix                                                                                                                                          |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.local missing` in a git worktree | Worktrees do not copy gitignored files. Copy `.env.local` (and `.env.test.local`, if present) from the main checkout path the doctor prints. |
| `.env.local missing` elsewhere         | Copy `.env.example` and fill it in, or use the Catalyst CLI to link a store.                                                                 |
| `chromium missing`                     | `npx playwright install chromium`. On a fresh Linux box or in CI, use `npx playwright install --with-deps chromium`.                         |
| `dependencies`                         | `pnpm install` (the monorepo and new projects use pnpm).                                                                                     |

`WARN` lines are optional capabilities: ffmpeg gives GIF/MP4 output, `gh` 2.99.0+ posts evidence straight to the PR, and a test customer enables signed-in journeys.

## 2. Launch

```sh
verify launch            # next dev on port 3100
verify launch --prod     # next build + next start, closer to production; slower
verify launch --port 3200
```

`launch` builds `@bigcommerce/catalyst-client` when the monorepo needs it, regenerates GraphQL types, and starts Next.js detached with its log at `.verification/server.log`. It returns once the home page serves a Catalyst page; the first dev compile can take a few minutes. It refuses a busy port instead of attaching to someone else's server.

A developer who already runs `pnpm dev` can skip `launch` and pass `--url http://localhost:3000` to the other commands. Next.js allows only one `next dev` per directory, so if `launch` reports the server exiting at startup, check for an existing dev server and use `--url` instead.

## 3. Find stable handles

```sh
verify explore /                       # whole page
verify explore /register --selector main
verify explore "/search?term=shirt" --device mobile --screenshot tmp.png
```

`explore` prints the page's ARIA snapshot. Build locators from roles and accessible names (`page.getByRole('button', { name: 'Add to cart' })`). Avoid CSS classes, which are Tailwind utilities and change freely, and avoid DOM position.

Before writing a journey, read the matching feature file in [`features/`](features/README.md). It lists entry points, known handles, and gotchas for each area of the storefront.

## 4. Write a journey

A journey is a small ES module. Keep throwaway journeys in `.verification/journeys/`, which is gitignored:

```js
// .verification/journeys/state-field.mjs
export const meta = { title: 'Register: State/Province follows country', feature: 'account' };

export default async function journey({ page, step, expect }) {
  await step('Open the registration form', async () => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  await step('Country without states hides State/Province', async () => {
    // ...interact, then assert what the shopper sees. Match by label: the field can be a
    // textbox or a dropdown, and a role-based "absent" check would pass on the wrong one.
    await expect(page.getByLabel('State/Province', { exact: true })).toHaveCount(0);
  });
}
```

The journey receives:

- `page`, `context`: Playwright objects with `baseURL` set, so `page.goto('/cart')` works.
- `step(label, fn, { fullPage })`: runs `fn`, waits for the network to settle, then screenshots. If `fn` throws, it saves a `-FAILED` screenshot and the run fails.
- `expect`: Playwright's auto-waiting assertions. Assert inside every step; a screenshot with no assertion proves nothing.
- `env`: values from `.env.test.local`, such as test customer credentials.

## 5. Capture

```sh
verify capture .verification/journeys/state-field.mjs
verify capture .verification/journeys/state-field.mjs --device mobile
```

Each run writes `.verification/runs/<timestamp>-<name>-<device>/` containing:

- `video.webm`, plus `video.mp4` and `video.gif` when ffmpeg is installed
- `NN-<step>.png` for every step
- `trace.zip` (open it with `npx playwright show-trace trace.zip`)
- `manifest.json` (git SHA, dirty flag, OS, viewport, step results, console errors, same-origin 4xx/5xx responses)
- `summary.md`

`git.dirtyFiles` lists uncommitted tracked files, and the evidence names them. `next dev` rewrites `AGENTS.md` on start, so that entry alone does not mean untested code.

Exit code 0 means every step passed. Read `manifest.json` → `consoleErrors` even when the run passes; a new hydration error is a finding.

**Responsive changes:** capture both `--device desktop` and `--device mobile`.
**Before/after:** for a visual change, capture the base branch too. Run `git worktree add ../catalyst-base origin/<base>`, install dependencies, copy `.env.local`, then `verify launch --port 3101`. Capture with `--label before --url http://localhost:3101` there, and with `--label after` on your branch. Stop the base server from the base worktree.

## 6. Publish to the pull request

Evidence belongs on the PR, posted from the CLI. Use **GitHub CLI 2.99.0 or newer**. That release added `--attach` to `gh pr create`, `gh pr edit`, and `gh pr comment`, which upload images and videos as native GitHub attachments: MP4s play inline and access follows the repository. Check with `gh --version`. Upgrade with `brew upgrade gh` (macOS), `winget upgrade --id GitHub.cli` (Windows), or your Linux package manager / [the releases page](https://github.com/cli/cli/releases), then run `gh auth login`. `verify doctor` warns when `gh` is missing, too old, or signed out.

```sh
verify publish                                     # latest run → new comment on this branch's PR
verify publish <desktop-run> <mobile-run>          # several runs in one comment
verify publish <run> --pr 123 --into body          # into the PR body instead of a comment
verify publish <run> --dry-run                     # write the markdown and print the gh command only
```

`publish` writes the evidence markdown (recording, step table, screenshots, console errors), then posts it with `gh`. Images are sized by orientation: landscape captures stack at 720px, portrait (mobile) captures sit side by side as a filmstrip, and GIFs are rendered to fit within 800×600 and start at the first page load rather than on a blank frame. The PR defaults to the current branch's (`gh pr view`); pass `--pr <number|url>` otherwise. With `--into body`, it replaces a `<!-- verification-evidence -->` marker if the body has one (put it under **Testing**), or else appends a section.

GitHub only accepts `--attach` uploads from accounts with **write access** to the PR's repository. `--to auto` (the default) checks that and picks the route:

| Situation                                                                            | Route    | Result                                                                                                                                                               |
| ------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Write access, `gh` ≥ 2.99.0                                                          | `attach` | Native attachments on the PR; video plays inline. Traces stay local (not a media type).                                                                              |
| No write access (fork contribution to a **confirmed public** repo), or `gh` < 2.99.0 | `gist`   | Files go to a secret gist you own; the markdown, posted by `gh`, embeds the GIF and links the MP4 and trace.                                                         |
| Same, but the repository is private                                                  | `branch` | Files go to an orphan `verification-evidence/<branch>` on `--remote` (default `origin`; use your fork) so GitHub's access control applies. The PR diff is untouched. |
| `gh` missing or signed out, or the repository's visibility is unknown                | `manual` | Prints the files to drag into a PR comment on github.com, which hosts them and plays MP4 inline.                                                                     |

Force a route with `--to attach|gist|branch|manual`. Secret gists are unlisted but readable by anyone with the link, so `auto` picks `gist` only when GitHub confirms the repository is public. If it cannot read the visibility, it falls back to `manual` rather than guess; pass `--to gist` yourself if you know the repository is public. Never use `gist` for a private storefront's evidence.

**By hand.** The `attach` route is plain `gh`, so a person can do the same thing without the helper. Run it from the directory that holds the files. `gh` rewrites any `![alt](./path)` reference in the body that matches an `--attach` path to the uploaded URL, and appends files the body does not reference:

```sh
gh pr comment 123 --body-file evidence.md --attach ./video.mp4 --attach './03-result.png#State/Province hidden'
```

The limit is 50 files per command. If some uploads fail, `gh` still posts the rest and exits non-zero.

## 7. Clean up

```sh
verify stop
```

This stops only the server that `launch` started, using its recorded PID: process group on macOS and Linux, `taskkill /T` on Windows. It never removes `.verification/runs/`; evidence must outlive the server. Delete old runs by hand when you no longer need them. Run `stop` after failed attempts too, so you do not strand ports.

## Reporting

End with a short report containing:

- Which feature and entry points were driven, and on which devices.
- Pass or fail per step, linked to the evidence (`pr-evidence.md` or the run directory).
- Anything skipped or blocked, with the missing precondition. Never report a skipped entry point as verified through a different path.
- Any console errors or failed requests recorded during the run.

## Platform notes

- **Windows:** use the same commands in PowerShell or cmd, with forward slashes in paths. The helper spawns Node directly, so it needs no bash and no `.cmd` shims. Install ffmpeg with `winget install Gyan.FFmpeg`.
- **WSL:** run everything inside WSL, including Node, the browser, and the git checkout. Do not mix a Windows Node with a WSL checkout.
- **Linux/CI (headless):** run `npx playwright install --with-deps chromium` once. No display is needed.
- **macOS:** install ffmpeg with `brew install ffmpeg`.
- **Watching the browser:** set `VERIFY_HEADED=1` (`$env:VERIFY_HEADED=1` in PowerShell).

## Keep the feature map honest

[`features/`](features/README.md) is the maintained recipe book. When a verification run teaches you something, update the matching file in the same PR: a new entry point, a handle that changed, or a gotcha that cost time. Add a new file when you verify an area that has none.

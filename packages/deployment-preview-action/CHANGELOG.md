# Changelog

## 1.1.0

### Minor Changes

- [#3194](https://github.com/bigcommerce/catalyst/pull/3194) [`c3075b4`](https://github.com/bigcommerce/catalyst/commit/c3075b481205503f209e41e93a183e1acf493b8f) Thanks [@jordanarldt](https://github.com/jordanarldt)! - Add a GitHub Action that deploys Catalyst pull request previews to a shared
  native hosting project. The newest open pull request deploys automatically; any
  other takes the preview over with a `redeploy preview` comment.

All notable changes to this project are documented here.

This project adheres to [Semantic Versioning](https://semver.org/). Patch
releases are fixes only, minor releases add backwards-compatible functionality,
and major releases contain backwards-incompatible changes. Each release is
tagged as `preview-action-v<version>`, with a moving `preview-action-v<major>`
that consumers pin. These tags are separate from Catalyst's package releases:
the action is excluded from changesets and released on its own cadence.

## 1.0.0

### Added

- Initial release. Deploys a Catalyst pull request preview to a shared native
  hosting project identified by `project-uuid`.
- The newest open pull request deploys automatically on push. Any other pull
  request takes the preview over with a `redeploy preview` comment.
- Pull request comments are kept accurate across pull requests: the one that
  loses the preview is told, and repeated pushes do not re-notify.
- `auto-deploy-newest` input to require the comment command in every case.
- Command feedback through reactions on the triggering comment, and a comment
  explaining any failure.

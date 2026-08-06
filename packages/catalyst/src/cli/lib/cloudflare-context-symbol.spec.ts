import { getCloudflareContext } from '@opennextjs/cloudflare';
import { afterEach, expect, test } from 'vitest';

import { OPENNEXT_CLOUDFLARE_VERSION } from './commerce-hosting';

/**
 * Contract test for a cross-package assumption.
 *
 * `core/lib/kv/adapters/cloudflare-kv.ts` reaches the Cloudflare context by
 * reading `globalThis[Symbol.for('__cloudflare-context__')]` directly, rather
 * than importing `getCloudflareContext` from `@opennextjs/cloudflare` — that
 * package is deliberately absent from `core`'s dependencies, and importing it
 * from there breaks `next build` (see the comment on
 * `CLOUDFLARE_CONTEXT_SYMBOL_KEY` in that file).
 *
 * That key is an internal detail of `@opennextjs/cloudflare`. If a version
 * bump changes it, the adapter would silently return null and every
 * native-hosted store would quietly downgrade to an in-process cache with no
 * error and no signal.
 *
 * This test lives in `packages/catalyst` because that's the package with
 * `@opennextjs/cloudflare` actually installed (as a peerDependency), so it can
 * call the real implementation. The literal below is duplicated on purpose —
 * importing core's constant across the package boundary isn't worth it. Keep
 * the two in sync; core's copy points back here.
 */
const CLOUDFLARE_CONTEXT_SYMBOL_KEY = '__cloudflare-context__';

afterEach(() => {
  Reflect.deleteProperty(globalThis, Symbol.for(CLOUDFLARE_CONTEXT_SYMBOL_KEY));
});

test('the real getCloudflareContext reads the symbol key core relies on', () => {
  const sentinel = { env: { CATALYST_ROUTES_KV: { marker: 'sentinel' } } };

  Reflect.set(globalThis, Symbol.for(CLOUDFLARE_CONTEXT_SYMBOL_KEY), sentinel);

  // If this returns the sentinel, the key core reads is still the key the
  // package writes. If a version bump changed the key, the real
  // implementation would find nothing there and throw instead.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  expect(getCloudflareContext() as unknown).toBe(sentinel);
});

test('getCloudflareContext resolves the value synchronously, with no await', () => {
  // core's adapter reads the global synchronously. Guard the sync path
  // specifically: the async variant has a Wrangler-based fallback that the
  // sync one does not, so "async mode works" would not imply this.
  const sentinel = { env: {} };

  Reflect.set(globalThis, Symbol.for(CLOUDFLARE_CONTEXT_SYMBOL_KEY), sentinel);

  const result: unknown = getCloudflareContext();

  expect(result).not.toBeInstanceOf(Promise);
  expect(result).toBe(sentinel);
});

test('the pinned OpenNext version this contract was verified against is unchanged', () => {
  // A bump here is the trigger to re-verify the symbol key above against the
  // new version's `dist/api/cloudflare-context.js`.
  expect(OPENNEXT_CLOUDFLARE_VERSION).toBe('1.17.3');
});

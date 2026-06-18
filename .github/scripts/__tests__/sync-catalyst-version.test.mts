import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildCatalystField, syncCatalystField } from '../sync-catalyst-version.mts';

describe('buildCatalystField', () => {
  it('derives version and ref from name + version', () => {
    assert.deepEqual(
      buildCatalystField({ name: '@bigcommerce/catalyst-core', version: '1.7.0' }),
      { version: '1.7.0', ref: '@bigcommerce/catalyst-core@1.7.0' },
    );
  });
});

describe('syncCatalystField', () => {
  it('adds the catalyst field mirroring version when absent', () => {
    const input = `${JSON.stringify(
      { name: '@bigcommerce/catalyst-core', version: '1.8.0' },
      null,
      2,
    )}\n`;

    const output = JSON.parse(syncCatalystField(input));

    assert.deepEqual(output.catalyst, {
      version: '1.8.0',
      ref: '@bigcommerce/catalyst-core@1.8.0',
    });
  });

  it('updates a stale catalyst field to the current version', () => {
    const input = `${JSON.stringify(
      {
        name: '@bigcommerce/catalyst-core',
        version: '2.0.0',
        catalyst: { version: '1.9.0', ref: '@bigcommerce/catalyst-core@1.9.0' },
      },
      null,
      2,
    )}\n`;

    const output = JSON.parse(syncCatalystField(input));

    assert.deepEqual(output.catalyst, {
      version: '2.0.0',
      ref: '@bigcommerce/catalyst-core@2.0.0',
    });
  });

  it('is idempotent and preserves the trailing newline', () => {
    const input = `${JSON.stringify(
      {
        name: '@bigcommerce/catalyst-core',
        version: '1.7.0',
        catalyst: { version: '1.7.0', ref: '@bigcommerce/catalyst-core@1.7.0' },
      },
      null,
      2,
    )}\n`;

    assert.equal(syncCatalystField(input), input);
  });
});

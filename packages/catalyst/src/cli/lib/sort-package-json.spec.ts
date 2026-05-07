import { describe, expect, it } from 'vitest';

import { sortPackageJsonFields } from './sort-package-json';

describe('sortPackageJsonFields', () => {
  it('places known fields in canonical order', () => {
    const input = {
      dependencies: { next: '^15.0.0' },
      scripts: { build: 'next build' },
      version: '1.0.0',
      name: '@bigcommerce/catalyst-core',
    };

    expect(Object.keys(sortPackageJsonFields(input))).toEqual([
      'name',
      'version',
      'scripts',
      'dependencies',
    ]);
  });

  it('preserves all canonical fields when present', () => {
    const input = {
      devDependencies: { vitest: '^3.0.0' },
      dependencies: { next: '^15.0.0' },
      scripts: { build: 'next build' },
      engines: { node: '^20.0.0' },
      private: true,
      version: '1.0.0',
      description: 'A Catalyst storefront',
      name: '@bigcommerce/catalyst-core',
    };

    expect(Object.keys(sortPackageJsonFields(input))).toEqual([
      'name',
      'description',
      'version',
      'private',
      'engines',
      'scripts',
      'dependencies',
      'devDependencies',
    ]);
  });

  it('appends unknown fields after canonical ones, preserving their relative order', () => {
    const input = {
      keywords: ['catalyst'],
      name: '@bigcommerce/catalyst-core',
      repository: { type: 'git', url: 'git+https://example.com/repo.git' },
      scripts: { build: 'next build' },
      license: 'MIT',
    };

    expect(Object.keys(sortPackageJsonFields(input))).toEqual([
      'name',
      'scripts',
      'keywords',
      'repository',
      'license',
    ]);
  });

  it('does not mutate values', () => {
    const input = {
      name: '@bigcommerce/catalyst-core',
      scripts: { build: 'next build' },
      dependencies: { next: '^15.0.0' },
    };

    const result = sortPackageJsonFields(input);

    expect(result.scripts).toEqual({ build: 'next build' });
    expect(result.dependencies).toEqual({ next: '^15.0.0' });
    expect(result.name).toBe('@bigcommerce/catalyst-core');
  });

  it('handles an empty object', () => {
    expect(sortPackageJsonFields({})).toEqual({});
  });
});

import { satisfies } from 'semver';

const REQUIRED_NODE_VERSIONS = ['^24'];

const isNodeVersionSupported = (version: string) =>
  REQUIRED_NODE_VERSIONS.some((range) => satisfies(version, range));

describe('Node.js version gating (mirrors bin/index.cjs)', () => {
  it('accepts the minimum supported version (24.0.0)', () => {
    expect(isNodeVersionSupported('24.0.0')).toBe(true);
  });

  it('accepts a recent Node v24 release', () => {
    expect(isNodeVersionSupported('24.1.0')).toBe(true);
  });

  it('rejects Node v20', () => {
    expect(isNodeVersionSupported('20.0.0')).toBe(false);
  });

  it('rejects Node v22', () => {
    expect(isNodeVersionSupported('22.0.0')).toBe(false);
  });

  it('rejects older Node v18', () => {
    expect(isNodeVersionSupported('18.0.0')).toBe(false);
  });

  it('rejects odd-numbered Node v23', () => {
    expect(isNodeVersionSupported('23.0.0')).toBe(false);
  });
});

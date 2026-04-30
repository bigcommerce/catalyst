import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { z } from 'zod';

import { setupCommerceHosting } from './setup-commerce-hosting';

const packageJsonSchema = z.record(z.string(), z.unknown());
const projectJsonSchema = z.object({
  projectUuid: z.string(),
  framework: z.string(),
  storeHash: z.string().optional(),
  accessToken: z.string().optional(),
});

let projectDir: string;

beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), 'create-catalyst-test-'));
});

afterEach(() => {
  rmSync(projectDir, { recursive: true, force: true });
});

function writeCorePackageJson(contents: unknown) {
  const coreDir = join(projectDir, 'core');

  mkdirSync(coreDir, { recursive: true });
  writeFileSync(join(coreDir, 'package.json'), JSON.stringify(contents, null, 2));
}

function writeCoreProxyFile(contents: string) {
  const coreDir = join(projectDir, 'core');

  mkdirSync(coreDir, { recursive: true });
  writeFileSync(join(coreDir, 'proxy.ts'), contents);
}

function readCorePackageJson() {
  return packageJsonSchema.parse(
    JSON.parse(readFileSync(join(projectDir, 'core', 'package.json'), 'utf-8')),
  );
}

function readProjectJson() {
  return projectJsonSchema.parse(
    JSON.parse(readFileSync(join(projectDir, 'core', '.bigcommerce', 'project.json'), 'utf-8')),
  );
}

describe('setupCommerceHosting', () => {
  it('rewrites the build script and adds a deploy script', () => {
    writeCorePackageJson({
      name: '@bigcommerce/catalyst-core',
      scripts: {
        dev: 'npm run generate && next dev',
        generate: 'dotenv -e .env.local -- node ./scripts/generate.cjs',
        build: 'npm run generate && next build',
        start: 'next start',
      },
    });

    setupCommerceHosting({ projectDir, projectUuid: 'uuid-abc' });

    expect(readCorePackageJson().scripts).toEqual({
      dev: 'npm run generate && next dev',
      generate: 'dotenv -e .env.local -- node ./scripts/generate.cjs',
      build: 'npm run generate && catalyst build',
      start: 'next start',
      deploy: 'catalyst deploy',
    });
  });

  it('leaves the `dev` and `start` scripts alone so local development is unaffected', () => {
    writeCorePackageJson({
      scripts: {
        dev: 'npm run generate && next dev',
        build: 'npm run generate && next build',
        start: 'next start',
      },
    });

    setupCommerceHosting({ projectDir, projectUuid: 'u' });

    expect(readCorePackageJson().scripts).toMatchObject({
      dev: 'npm run generate && next dev',
      start: 'next start',
    });
  });

  it('adds native hosting dependencies while preserving existing ones', () => {
    writeCorePackageJson({
      scripts: { dev: 'next dev' },
      dependencies: { next: '^15.0.0', react: '^18.0.0' },
    });

    setupCommerceHosting({ projectDir, projectUuid: 'u' });

    const pkg = readCorePackageJson();

    expect(pkg.dependencies).toMatchObject({ next: '^15.0.0', react: '^18.0.0' });
    expect(pkg.dependencies).toHaveProperty('@bigcommerce/catalyst');
    expect(pkg.dependencies).toHaveProperty('@opennextjs/cloudflare');
  });

  it('preserves unrelated top-level package.json fields', () => {
    writeCorePackageJson({
      name: '@bigcommerce/catalyst-core',
      description: 'test description',
      version: '1.2.3',
      private: true,
      scripts: { dev: 'next dev' },
      devDependencies: { jest: '^29.0.0' },
    });

    setupCommerceHosting({ projectDir, projectUuid: 'u' });

    const pkg = readCorePackageJson();

    expect(pkg.name).toBe('@bigcommerce/catalyst-core');
    expect(pkg.description).toBe('test description');
    expect(pkg.version).toBe('1.2.3');
    expect(pkg.private).toBe(true);
    expect(pkg.devDependencies).toEqual({ jest: '^29.0.0' });
  });

  it('writes core/.bigcommerce/project.json with the correct shape', () => {
    writeCorePackageJson({ scripts: { dev: 'next dev' } });

    setupCommerceHosting({ projectDir, projectUuid: 'uuid-xyz' });

    expect(readProjectJson()).toEqual({ projectUuid: 'uuid-xyz', framework: 'catalyst' });
  });

  it('includes storeHash and accessToken in project.json when provided', () => {
    writeCorePackageJson({ scripts: { dev: 'next dev' } });

    setupCommerceHosting({
      projectDir,
      projectUuid: 'uuid-xyz',
      storeHash: 'abc123',
      accessToken: 'token-xyz',
    });

    expect(readProjectJson()).toEqual({
      projectUuid: 'uuid-xyz',
      framework: 'catalyst',
      storeHash: 'abc123',
      accessToken: 'token-xyz',
    });
  });

  it('omits storeHash and accessToken when not provided', () => {
    writeCorePackageJson({ scripts: { dev: 'next dev' } });

    setupCommerceHosting({ projectDir, projectUuid: 'uuid-xyz' });

    const projectJson = readProjectJson();

    expect(projectJson.storeHash).toBeUndefined();
    expect(projectJson.accessToken).toBeUndefined();
  });

  it('includes only the credentials that are provided', () => {
    writeCorePackageJson({ scripts: { dev: 'next dev' } });

    setupCommerceHosting({
      projectDir,
      projectUuid: 'uuid-xyz',
      storeHash: 'abc123',
    });

    const projectJson = readProjectJson();

    expect(projectJson.storeHash).toBe('abc123');
    expect(projectJson.accessToken).toBeUndefined();
  });

  it('throws when core/package.json is missing', () => {
    expect(() => setupCommerceHosting({ projectDir, projectUuid: 'u' })).toThrow();
  });

  it('throws when core/package.json has an invalid shape', () => {
    writeCorePackageJson({ scripts: { dev: 42 } });

    expect(() => setupCommerceHosting({ projectDir, projectUuid: 'u' })).toThrow();
  });

  describe('core/.env.local symlink', () => {
    it('creates a symlink at core/.env.local pointing to ../.env.local', () => {
      writeCorePackageJson({ scripts: { dev: 'next dev' } });

      setupCommerceHosting({ projectDir, projectUuid: 'u' });

      const coreEnvPath = join(projectDir, 'core', '.env.local');

      expect(lstatSync(coreEnvPath).isSymbolicLink()).toBe(true);
      expect(readlinkSync(coreEnvPath)).toBe(join('..', '.env.local'));
    });

    it('keeps both files in sync via the symlink target', () => {
      writeCorePackageJson({ scripts: { dev: 'next dev' } });
      writeFileSync(join(projectDir, '.env.local'), 'FOO=bar\n');

      setupCommerceHosting({ projectDir, projectUuid: 'u' });

      expect(readFileSync(join(projectDir, 'core', '.env.local'), 'utf-8')).toBe('FOO=bar\n');

      // Writing through the symlink path should land in the root file
      writeFileSync(join(projectDir, 'core', '.env.local'), 'FOO=baz\n');

      expect(readFileSync(join(projectDir, '.env.local'), 'utf-8')).toBe('FOO=baz\n');
    });

    it('does not clobber an existing core/.env.local file', () => {
      writeCorePackageJson({ scripts: { dev: 'next dev' } });
      mkdirSync(join(projectDir, 'core'), { recursive: true });
      writeFileSync(join(projectDir, 'core', '.env.local'), 'PRESERVE=me\n');

      setupCommerceHosting({ projectDir, projectUuid: 'u' });

      const coreEnvPath = join(projectDir, 'core', '.env.local');

      expect(lstatSync(coreEnvPath).isSymbolicLink()).toBe(false);
      expect(readFileSync(coreEnvPath, 'utf-8')).toBe('PRESERVE=me\n');
    });
  });

  describe('proxy.ts → middleware.ts conversion', () => {
    const proxyFixture = [
      "import { composeProxies } from './proxies/compose-proxies';",
      '',
      'export const proxy = composeProxies();',
      '',
      'export const config = {',
      "  matcher: ['/((?!api).*)'],",
      '};',
      '',
    ].join('\n');

    it('renames proxy.ts to middleware.ts, renames the export, and injects the edge runtime', () => {
      writeCorePackageJson({ scripts: { dev: 'next dev' } });
      writeCoreProxyFile(proxyFixture);

      setupCommerceHosting({ projectDir, projectUuid: 'u' });

      const middlewarePath = join(projectDir, 'core', 'middleware.ts');
      const proxyPath = join(projectDir, 'core', 'proxy.ts');

      expect(existsSync(middlewarePath)).toBe(true);
      expect(existsSync(proxyPath)).toBe(false);

      const middleware = readFileSync(middlewarePath, 'utf-8');

      expect(middleware).toContain('export const middleware = composeProxies()');
      expect(middleware).not.toContain('export const proxy');
      expect(middleware).toContain("runtime: 'experimental-edge'");
    });

    it('preserves the rest of the file contents', () => {
      writeCorePackageJson({ scripts: { dev: 'next dev' } });
      writeCoreProxyFile(proxyFixture);

      setupCommerceHosting({ projectDir, projectUuid: 'u' });

      const middleware = readFileSync(join(projectDir, 'core', 'middleware.ts'), 'utf-8');

      expect(middleware).toContain("import { composeProxies } from './proxies/compose-proxies';");
      expect(middleware).toContain("matcher: ['/((?!api).*)']");
    });

    it('is a no-op when proxy.ts does not exist', () => {
      writeCorePackageJson({ scripts: { dev: 'next dev' } });

      expect(() => setupCommerceHosting({ projectDir, projectUuid: 'u' })).not.toThrow();
      expect(existsSync(join(projectDir, 'core', 'middleware.ts'))).toBe(false);
    });
  });
});

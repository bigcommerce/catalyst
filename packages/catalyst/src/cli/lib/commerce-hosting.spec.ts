import { input, select } from '@inquirer/prompts';
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
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import { z } from 'zod';

import {
  promptAndCreateCommerceHostingProject,
  promptForCommerceHostingProject,
  setupCommerceHosting,
} from './commerce-hosting';
import * as projectLib from './project';
import { InfrastructureProjectValidationError } from './project';

vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  select: vi.fn(),
  Separator: class FakeSeparator {
    type = 'separator';
  },
}));

const inputMock = vi.mocked(input);
const selectMock = vi.mocked(select);

const API = { storeHash: 'store', accessToken: 'token', apiHost: 'api.example.com' };

function withTtyValue(value: boolean): () => void {
  const previous = Object.getOwnPropertyDescriptor(process.stdin, 'isTTY');

  Object.defineProperty(process.stdin, 'isTTY', { value, configurable: true });

  return () => {
    if (previous) {
      Object.defineProperty(process.stdin, 'isTTY', previous);
    } else {
      Reflect.deleteProperty(process.stdin, 'isTTY');
    }
  };
}

const withInteractiveTty = () => withTtyValue(true);
const withNonInteractiveTty = () => withTtyValue(false);

let fetchProjectsSpy: MockInstance<typeof projectLib.fetchProjects>;
let createProjectSpy: MockInstance<typeof projectLib.createProject>;
let consoleErrorSpy: MockInstance<(typeof console)['error']>;

beforeEach(() => {
  inputMock.mockReset();
  selectMock.mockReset();
  fetchProjectsSpy = vi.spyOn(projectLib, 'fetchProjects').mockResolvedValue([]);
  createProjectSpy = vi.spyOn(projectLib, 'createProject');
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  consoleErrorSpy.mockRestore();
});

function createdProject(uuid: string, name: string) {
  return {
    uuid,
    name,
    date_created: new Date(),
    date_modified: new Date(),
  };
}

describe('promptAndCreateCommerceHostingProject', () => {
  it('returns the created project when the first attempt succeeds', async () => {
    inputMock.mockResolvedValueOnce('my-project');
    createProjectSpy.mockResolvedValueOnce(createdProject('u', 'my-project'));

    const result = await promptAndCreateCommerceHostingProject(API, []);

    expect(result).toEqual({ uuid: 'u', name: 'my-project' });
    expect(createProjectSpy).toHaveBeenCalledTimes(1);
    expect(createProjectSpy).toHaveBeenCalledWith(
      'my-project',
      API.storeHash,
      API.accessToken,
      API.apiHost,
    );
  });

  it('trims whitespace from the entered name before calling the API', async () => {
    inputMock.mockResolvedValueOnce('  spaced  ');
    createProjectSpy.mockResolvedValueOnce(createdProject('u', 'spaced'));

    await promptAndCreateCommerceHostingProject(API, []);

    expect(createProjectSpy).toHaveBeenCalledWith(
      'spaced',
      API.storeHash,
      API.accessToken,
      API.apiHost,
    );
  });

  it('re-prompts after a validation error and succeeds on retry', async () => {
    inputMock.mockResolvedValueOnce('###').mockResolvedValueOnce('good-name');

    createProjectSpy
      .mockRejectedValueOnce(new InfrastructureProjectValidationError('Invalid name'))
      .mockResolvedValueOnce(createdProject('u', 'good-name'));

    const result = await promptAndCreateCommerceHostingProject(API, []);

    expect(result).toEqual({ uuid: 'u', name: 'good-name' });
    expect(inputMock).toHaveBeenCalledTimes(2);
    expect(createProjectSpy).toHaveBeenCalledTimes(2);
  });

  it('re-prompts multiple times until the server accepts the name', async () => {
    inputMock
      .mockResolvedValueOnce('bad1')
      .mockResolvedValueOnce('bad2')
      .mockResolvedValueOnce('good');

    createProjectSpy
      .mockRejectedValueOnce(new InfrastructureProjectValidationError('first failure'))
      .mockRejectedValueOnce(new InfrastructureProjectValidationError('second failure'))
      .mockResolvedValueOnce(createdProject('u', 'good'));

    const result = await promptAndCreateCommerceHostingProject(API, []);

    expect(result).toEqual({ uuid: 'u', name: 'good' });
    expect(inputMock).toHaveBeenCalledTimes(3);
    expect(createProjectSpy).toHaveBeenCalledTimes(3);
  });

  it('does not retry on non-validation errors', async () => {
    inputMock.mockResolvedValueOnce('whatever');
    createProjectSpy.mockRejectedValueOnce(new Error('500 server error'));

    await expect(promptAndCreateCommerceHostingProject(API, [])).rejects.toThrow(
      '500 server error',
    );

    expect(inputMock).toHaveBeenCalledTimes(1);
    expect(createProjectSpy).toHaveBeenCalledTimes(1);
  });

  it('passes the supplied default name to the initial prompt', async () => {
    inputMock.mockResolvedValueOnce('my-catalyst-store');
    createProjectSpy.mockResolvedValueOnce(createdProject('u', 'my-catalyst-store'));

    await promptAndCreateCommerceHostingProject(API, [], 'my-catalyst-store');

    expect(inputMock.mock.calls[0]?.[0].default).toBe('my-catalyst-store');
  });

  it('preserves the original default on retry so the user is not stuck with the rejected value', async () => {
    inputMock.mockResolvedValueOnce('bad-name').mockResolvedValueOnce('fixed-name');

    createProjectSpy
      .mockRejectedValueOnce(new InfrastructureProjectValidationError('Invalid'))
      .mockResolvedValueOnce(createdProject('u', 'fixed-name'));

    await promptAndCreateCommerceHostingProject(API, [], 'original-default');

    expect(inputMock.mock.calls[0]?.[0].default).toBe('original-default');
    expect(inputMock.mock.calls[1]?.[0].default).toBe('original-default');
  });

  it('uses a validator that rejects empty input', async () => {
    inputMock.mockResolvedValueOnce('ok');
    createProjectSpy.mockResolvedValueOnce(createdProject('u', 'ok'));

    await promptAndCreateCommerceHostingProject(API, []);

    const validator = inputMock.mock.calls[0]?.[0].validate;

    expect(validator).toBeDefined();
    expect(validator?.('')).toBe('Project name is required');
    expect(validator?.('   ')).toBe('Project name is required');
    expect(validator?.('name')).toBe(true);
  });

  it('rejects names that already exist on the store', async () => {
    inputMock.mockResolvedValueOnce('available');
    createProjectSpy.mockResolvedValueOnce(createdProject('u', 'available'));

    await promptAndCreateCommerceHostingProject(API, ['taken-one', 'taken-two']);

    const validator = inputMock.mock.calls[0]?.[0].validate;

    expect(validator).toBeDefined();
    expect(validator?.('taken-one')).toBe(
      'A Commerce Hosting project named "taken-one" already exists',
    );
    expect(validator?.('  taken-two  ')).toBe(
      'A Commerce Hosting project named "taken-two" already exists',
    );
    expect(validator?.('available')).toBe(true);
  });

  it('rejects names that match an existing project case-insensitively, and reports the stored name', async () => {
    inputMock.mockResolvedValueOnce('different');
    createProjectSpy.mockResolvedValueOnce(createdProject('u', 'different'));

    await promptAndCreateCommerceHostingProject(API, ['MyProject']);

    const validator = inputMock.mock.calls[0]?.[0].validate;

    expect(validator?.('myproject')).toBe(
      'A Commerce Hosting project named "MyProject" already exists',
    );
    expect(validator?.('MYPROJECT')).toBe(
      'A Commerce Hosting project named "MyProject" already exists',
    );
    expect(validator?.('  MyProject  ')).toBe(
      'A Commerce Hosting project named "MyProject" already exists',
    );
  });
});

describe('promptForCommerceHostingProject', () => {
  it('silently auto-creates with the supplied default name when no Commerce Hosting project conflicts (no existing projects)', async () => {
    fetchProjectsSpy.mockResolvedValue([]);
    createProjectSpy.mockResolvedValueOnce(createdProject('u', 'fresh'));

    const result = await promptForCommerceHostingProject(API, 'fresh');

    expect(result).toEqual({ uuid: 'u', name: 'fresh' });
    expect(selectMock).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
    expect(createProjectSpy).toHaveBeenCalledWith(
      'fresh',
      API.storeHash,
      API.accessToken,
      API.apiHost,
    );
  });

  it('silently auto-creates with the supplied default name when other projects exist but none conflict', async () => {
    fetchProjectsSpy.mockResolvedValue([
      { uuid: 'aaa', name: 'unrelated-one' },
      { uuid: 'bbb', name: 'unrelated-two' },
    ]);
    createProjectSpy.mockResolvedValueOnce(createdProject('new', 'my-store'));

    const result = await promptForCommerceHostingProject(API, 'my-store');

    expect(result).toEqual({ uuid: 'new', name: 'my-store' });
    expect(selectMock).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
    expect(createProjectSpy).toHaveBeenCalledWith(
      'my-store',
      API.storeHash,
      API.accessToken,
      API.apiHost,
    );
  });

  it('returns a selected existing project without calling create', async () => {
    const existing = [
      { uuid: 'aaa', name: 'first' },
      { uuid: 'bbb', name: 'second' },
    ];

    fetchProjectsSpy.mockResolvedValue(existing);

    selectMock
      .mockResolvedValueOnce('select-from-list')
      .mockResolvedValueOnce({ uuid: 'bbb', name: 'second' });

    const result = await promptForCommerceHostingProject(API, 'first');

    expect(result).toEqual({ uuid: 'bbb', name: 'second' });
    expect(createProjectSpy).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it('routes to the create flow when the default name conflicts and the user chooses to create a new project', async () => {
    fetchProjectsSpy.mockResolvedValue([{ uuid: 'aaa', name: 'default-name' }]);
    createProjectSpy.mockResolvedValueOnce(createdProject('new', 'new-proj'));

    selectMock.mockResolvedValueOnce('create');
    inputMock.mockResolvedValueOnce('new-proj');

    const result = await promptForCommerceHostingProject(API, 'default-name');

    expect(result).toEqual({ uuid: 'new', name: 'new-proj' });
    expect(createProjectSpy).toHaveBeenCalledWith(
      'new-proj',
      API.storeHash,
      API.accessToken,
      API.apiHost,
    );
    expect(inputMock.mock.calls[0]?.[0].default).toBe('default-name');
  });

  it('shows the conflict-aware message and three choices when a conflict exists', async () => {
    fetchProjectsSpy.mockResolvedValue([
      { uuid: 'aaa', name: 'My-Store' },
      { uuid: 'bbb', name: 'other-project' },
    ]);

    selectMock.mockResolvedValueOnce('create');
    inputMock.mockResolvedValueOnce('something-else');
    createProjectSpy.mockResolvedValueOnce(createdProject('new', 'something-else'));

    await promptForCommerceHostingProject(API, 'my-store');

    expect(selectMock.mock.calls[0]?.[0].message).toBe(
      'It looks like you already have an existing Commerce Hosting project named "My-Store". Would you like to use it, select from your projects, or create a new one?',
    );
    expect(selectMock.mock.calls[0]?.[0].choices).toEqual([
      { name: 'Use "My-Store"', value: 'use-named' },
      { name: 'Select from my projects', value: 'select-from-list' },
      { name: 'Create a new project', value: 'create' },
    ]);
  });

  it('returns the conflicting project directly when the user picks Use "<name>"', async () => {
    const conflict = { uuid: 'aaa', name: 'My-Store' };

    fetchProjectsSpy.mockResolvedValue([conflict, { uuid: 'bbb', name: 'other-project' }]);

    selectMock.mockResolvedValueOnce('use-named');

    const result = await promptForCommerceHostingProject(API, 'my-store');

    expect(result).toEqual(conflict);
    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(createProjectSpy).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
  });

  it('shows all projects (including the conflict) and a "Create a new project" option in the list', async () => {
    const conflict = { uuid: 'aaa', name: 'My-Store' };
    const other = { uuid: 'bbb', name: 'other-project' };

    fetchProjectsSpy.mockResolvedValue([conflict, other]);

    selectMock.mockResolvedValueOnce('select-from-list').mockResolvedValueOnce(other);

    const result = await promptForCommerceHostingProject(API, 'my-store');

    expect(result).toEqual(other);

    const projectChoices = selectMock.mock.calls[1]?.[0].choices ?? [];

    expect(projectChoices[0]).toEqual({ name: 'My-Store', value: conflict, description: 'aaa' });
    expect(projectChoices[1]).toEqual({
      name: 'other-project',
      value: other,
      description: 'bbb',
    });
    expect(projectChoices[projectChoices.length - 1]).toEqual({
      name: 'Create a new project',
      value: 'create-new',
    });
  });

  it('routes to the create flow when the user picks "Create a new project" from the list', async () => {
    const conflict = { uuid: 'aaa', name: 'My-Store' };
    const other = { uuid: 'bbb', name: 'other-project' };

    fetchProjectsSpy.mockResolvedValue([conflict, other]);
    createProjectSpy.mockResolvedValueOnce(createdProject('new', 'fresh-name'));

    selectMock.mockResolvedValueOnce('select-from-list').mockResolvedValueOnce('create-new');
    inputMock.mockResolvedValueOnce('fresh-name');

    const result = await promptForCommerceHostingProject(API, 'my-store');

    expect(result).toEqual({ uuid: 'new', name: 'fresh-name' });
    expect(createProjectSpy).toHaveBeenCalledWith(
      'fresh-name',
      API.storeHash,
      API.accessToken,
      API.apiHost,
    );
  });

  it('omits Select from my projects when the conflict is the only existing project', async () => {
    const conflict = { uuid: 'aaa', name: 'My-Store' };

    fetchProjectsSpy.mockResolvedValue([conflict]);

    selectMock.mockResolvedValueOnce('use-named');

    await promptForCommerceHostingProject(API, 'my-store');

    expect(selectMock.mock.calls[0]?.[0].choices).toEqual([
      { name: 'Use "My-Store"', value: 'use-named' },
      { name: 'Create a new project', value: 'create' },
    ]);
    expect(selectMock.mock.calls[0]?.[0].message).toBe(
      'It looks like you already have an existing Commerce Hosting project named "My-Store". Would you like to use it, or create a new one?',
    );
  });

  it('skips all prompts and creates with the supplied name when autoUseDefaultName is true', async () => {
    fetchProjectsSpy.mockResolvedValue([{ uuid: 'other', name: 'unrelated' }]);
    createProjectSpy.mockResolvedValueOnce(createdProject('u', 'auto-name'));

    const result = await promptForCommerceHostingProject(API, 'auto-name', true);

    expect(result).toEqual({ uuid: 'u', name: 'auto-name' });
    expect(fetchProjectsSpy).toHaveBeenCalled();
    expect(selectMock).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
    expect(createProjectSpy).toHaveBeenCalledWith(
      'auto-name',
      API.storeHash,
      API.accessToken,
      API.apiHost,
    );
  });

  it('returns the existing project when --project-name collides and the user picks Yes', async () => {
    const existing = { uuid: 'aaa', name: 'taken-name' };

    fetchProjectsSpy.mockResolvedValue([existing]);

    selectMock.mockResolvedValueOnce(true);

    const restoreTty = withInteractiveTty();

    try {
      const result = await promptForCommerceHostingProject(API, 'taken-name', true);

      expect(result).toEqual(existing);
      expect(createProjectSpy).not.toHaveBeenCalled();
      expect(selectMock.mock.calls[0]?.[0].message).toMatch(
        /A Commerce Hosting project named "taken-name" already exists/,
      );
    } finally {
      restoreTty();
    }
  });

  it('reuses the existing project without prompting when --use-existing is passed', async () => {
    const existing = { uuid: 'aaa', name: 'taken-name' };

    fetchProjectsSpy.mockResolvedValue([existing]);

    const result = await promptForCommerceHostingProject(API, 'taken-name', true, true);

    expect(result).toEqual(existing);
    expect(selectMock).not.toHaveBeenCalled();
    expect(createProjectSpy).not.toHaveBeenCalled();
  });

  it('exits without prompting in non-interactive environments when --use-existing is not passed', async () => {
    fetchProjectsSpy.mockResolvedValue([{ uuid: 'aaa', name: 'taken-name' }]);

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });
    const restoreTty = withNonInteractiveTty();

    try {
      await expect(promptForCommerceHostingProject(API, 'taken-name', true)).rejects.toThrow(
        'process.exit(1)',
      );

      expect(selectMock).not.toHaveBeenCalled();
      expect(createProjectSpy).not.toHaveBeenCalled();
    } finally {
      exitSpy.mockRestore();
      restoreTty();
    }
  });

  it('detects --project-name collision case-insensitively and reports the stored name', async () => {
    const existing = { uuid: 'aaa', name: 'MyProject' };

    fetchProjectsSpy.mockResolvedValue([existing]);

    selectMock.mockResolvedValueOnce(true);

    const restoreTty = withInteractiveTty();

    try {
      const result = await promptForCommerceHostingProject(API, 'myproject', true);

      expect(result).toEqual(existing);
      expect(createProjectSpy).not.toHaveBeenCalled();
      expect(selectMock.mock.calls[0]?.[0].message).toMatch(
        /A Commerce Hosting project named "MyProject" already exists/,
      );
    } finally {
      restoreTty();
    }
  });

  it('exits when --project-name collides and the user picks No', async () => {
    fetchProjectsSpy.mockResolvedValue([{ uuid: 'aaa', name: 'taken-name' }]);

    selectMock.mockResolvedValueOnce(false);

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });
    const restoreTty = withInteractiveTty();

    try {
      await expect(promptForCommerceHostingProject(API, 'taken-name', true)).rejects.toThrow(
        'process.exit(1)',
      );

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(createProjectSpy).not.toHaveBeenCalled();
    } finally {
      exitSpy.mockRestore();
      restoreTty();
    }
  });

  it('exits the process when auto-create fails with a validation error instead of re-prompting', async () => {
    fetchProjectsSpy.mockResolvedValue([]);
    createProjectSpy.mockRejectedValueOnce(
      new InfrastructureProjectValidationError('Name already taken'),
    );

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });

    await expect(promptForCommerceHostingProject(API, 'taken-name', true)).rejects.toThrow(
      'process.exit(1)',
    );

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(inputMock).not.toHaveBeenCalled();
    expect(createProjectSpy).toHaveBeenCalledTimes(1);

    exitSpy.mockRestore();
  });

  it('propagates errors from fetchProjects', async () => {
    fetchProjectsSpy.mockRejectedValue(new Error('network down'));

    await expect(promptForCommerceHostingProject(API, 'whatever')).rejects.toThrow('network down');
    expect(selectMock).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
  });
});

describe('setupCommerceHosting', () => {
  const packageJsonSchema = z.record(z.string(), z.unknown());
  const projectJsonSchema = z.object({
    projectUuid: z.string(),
    framework: z.string(),
    storeHash: z.string().optional(),
    accessToken: z.string().optional(),
  });

  let projectDir: string;

  beforeEach(() => {
    projectDir = mkdtempSync(join(tmpdir(), 'catalyst-create-test-'));
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

  it('adds the OpenNext Cloudflare dep while preserving existing dependencies', () => {
    writeCorePackageJson({
      scripts: { dev: 'next dev' },
      dependencies: { next: '^15.0.0', react: '^18.0.0' },
    });

    setupCommerceHosting({ projectDir, projectUuid: 'u' });

    const pkg = readCorePackageJson();

    expect(pkg.dependencies).toMatchObject({ next: '^15.0.0', react: '^18.0.0' });
    expect(pkg.dependencies).toHaveProperty('@opennextjs/cloudflare');
  });

  it('does not modify package.json scripts (handled by setupCoreProject)', () => {
    writeCorePackageJson({
      scripts: {
        dev: 'npm run generate && next dev',
        build: 'npm run generate && next build',
        start: 'next start',
      },
    });

    setupCommerceHosting({ projectDir, projectUuid: 'u' });

    expect(readCorePackageJson().scripts).toEqual({
      dev: 'npm run generate && next dev',
      build: 'npm run generate && next build',
      start: 'next start',
    });
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
    writeCorePackageJson({ dependencies: { next: 42 } });

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

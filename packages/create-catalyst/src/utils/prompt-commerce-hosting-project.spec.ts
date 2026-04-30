import { input, select } from '@inquirer/prompts';

import { CliApi } from './cli-api';
import { InfrastructureProjectValidationError } from './cli-api-errors';
import {
  promptAndCreateCommerceHostingProject,
  promptForCommerceHostingProject,
} from './prompt-commerce-hosting-project';

jest.mock('@inquirer/prompts', () => ({
  input: jest.fn(),
  select: jest.fn(),
  Separator: class FakeSeparator {
    type = 'separator';
  },
}));

const inputMock = jest.mocked(input);
const selectMock = jest.mocked(select);

function makeCliApi(overrides: Partial<CliApi> = {}): CliApi {
  const api = new CliApi({
    origin: 'https://cli.example',
    storeHash: 'store',
    accessToken: 'token',
    apiHostname: 'api.example.com',
  });

  Object.assign(api, overrides);

  return api;
}

function makeCliApiWithCreate(createImpl: jest.Mock): CliApi {
  return makeCliApi({ createInfrastructureProject: createImpl });
}

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

let consoleErrorSpy: jest.SpyInstance;

beforeEach(() => {
  inputMock.mockReset();
  selectMock.mockReset();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

describe('promptAndCreateCommerceHostingProject', () => {
  it('returns the created project when the first attempt succeeds', async () => {
    inputMock.mockResolvedValueOnce('my-project');

    const create = jest.fn().mockResolvedValue({ uuid: 'u', name: 'my-project' });

    const result = await promptAndCreateCommerceHostingProject(makeCliApiWithCreate(create), []);

    expect(result).toEqual({ uuid: 'u', name: 'my-project' });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith('my-project');
  });

  it('trims whitespace from the entered name before calling the API', async () => {
    inputMock.mockResolvedValueOnce('  spaced  ');

    const create = jest.fn().mockResolvedValue({ uuid: 'u', name: 'spaced' });

    await promptAndCreateCommerceHostingProject(makeCliApiWithCreate(create), []);

    expect(create).toHaveBeenCalledWith('spaced');
  });

  it('re-prompts after a validation error and succeeds on retry', async () => {
    inputMock.mockResolvedValueOnce('###').mockResolvedValueOnce('good-name');

    const create = jest
      .fn()
      .mockRejectedValueOnce(new InfrastructureProjectValidationError('Invalid name'))
      .mockResolvedValueOnce({ uuid: 'u', name: 'good-name' });

    const result = await promptAndCreateCommerceHostingProject(makeCliApiWithCreate(create), []);

    expect(result).toEqual({ uuid: 'u', name: 'good-name' });
    expect(inputMock).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid name'));
  });

  it('re-prompts multiple times until the server accepts the name', async () => {
    inputMock
      .mockResolvedValueOnce('bad1')
      .mockResolvedValueOnce('bad2')
      .mockResolvedValueOnce('good');

    const create = jest
      .fn()
      .mockRejectedValueOnce(new InfrastructureProjectValidationError('first failure'))
      .mockRejectedValueOnce(new InfrastructureProjectValidationError('second failure'))
      .mockResolvedValueOnce({ uuid: 'u', name: 'good' });

    const result = await promptAndCreateCommerceHostingProject(makeCliApiWithCreate(create), []);

    expect(result).toEqual({ uuid: 'u', name: 'good' });
    expect(inputMock).toHaveBeenCalledTimes(3);
    expect(create).toHaveBeenCalledTimes(3);
  });

  it('does not retry on non-validation errors', async () => {
    inputMock.mockResolvedValueOnce('whatever');

    const create = jest.fn().mockRejectedValueOnce(new Error('500 server error'));

    await expect(
      promptAndCreateCommerceHostingProject(makeCliApiWithCreate(create), []),
    ).rejects.toThrow('500 server error');

    expect(inputMock).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('passes the supplied default name to the initial prompt', async () => {
    inputMock.mockResolvedValueOnce('my-catalyst-store');

    const create = jest.fn().mockResolvedValue({ uuid: 'u', name: 'my-catalyst-store' });

    await promptAndCreateCommerceHostingProject(
      makeCliApiWithCreate(create),
      [],
      'my-catalyst-store',
    );

    expect(inputMock.mock.calls[0]?.[0].default).toBe('my-catalyst-store');
  });

  it('preserves the original default on retry so the user is not stuck with the rejected value', async () => {
    inputMock.mockResolvedValueOnce('bad-name').mockResolvedValueOnce('fixed-name');

    const create = jest
      .fn()
      .mockRejectedValueOnce(new InfrastructureProjectValidationError('Invalid'))
      .mockResolvedValueOnce({ uuid: 'u', name: 'fixed-name' });

    await promptAndCreateCommerceHostingProject(
      makeCliApiWithCreate(create),
      [],
      'original-default',
    );

    expect(inputMock.mock.calls[0]?.[0].default).toBe('original-default');
    expect(inputMock.mock.calls[1]?.[0].default).toBe('original-default');
  });

  it('uses a validator that rejects empty input', async () => {
    inputMock.mockResolvedValueOnce('ok');

    const create = jest.fn().mockResolvedValue({ uuid: 'u', name: 'ok' });

    await promptAndCreateCommerceHostingProject(makeCliApiWithCreate(create), []);

    const validator = inputMock.mock.calls[0]?.[0].validate;

    expect(validator).toBeDefined();
    expect(validator?.('')).toBe('Project name is required');
    expect(validator?.('   ')).toBe('Project name is required');
    expect(validator?.('name')).toBe(true);
  });

  it('rejects names that already exist on the store', async () => {
    inputMock.mockResolvedValueOnce('available');

    const create = jest.fn().mockResolvedValue({ uuid: 'u', name: 'available' });

    await promptAndCreateCommerceHostingProject(makeCliApiWithCreate(create), [
      'taken-one',
      'taken-two',
    ]);

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

    const create = jest.fn().mockResolvedValue({ uuid: 'u', name: 'different' });

    await promptAndCreateCommerceHostingProject(makeCliApiWithCreate(create), ['MyProject']);

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
    const list = jest.fn().mockResolvedValue([]);
    const create = jest.fn().mockResolvedValue({ uuid: 'u', name: 'fresh' });

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const result = await promptForCommerceHostingProject(api, 'fresh');

    expect(result).toEqual({ uuid: 'u', name: 'fresh' });
    expect(selectMock).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith('fresh');
  });

  it('silently auto-creates with the supplied default name when other projects exist but none conflict', async () => {
    const list = jest.fn().mockResolvedValue([
      { uuid: 'aaa', name: 'unrelated-one' },
      { uuid: 'bbb', name: 'unrelated-two' },
    ]);
    const create = jest.fn().mockResolvedValue({ uuid: 'new', name: 'my-store' });

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const result = await promptForCommerceHostingProject(api, 'my-store');

    expect(result).toEqual({ uuid: 'new', name: 'my-store' });
    expect(selectMock).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith('my-store');
  });

  it('returns a selected existing project without calling create', async () => {
    const existing = [
      { uuid: 'aaa', name: 'first' },
      { uuid: 'bbb', name: 'second' },
    ];
    const list = jest.fn().mockResolvedValue(existing);
    const create = jest.fn();

    selectMock
      .mockResolvedValueOnce('select-from-list')
      .mockResolvedValueOnce({ uuid: 'bbb', name: 'second' });

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    // Default name conflicts with one of the existing projects so the action prompt fires.
    const result = await promptForCommerceHostingProject(api, 'first');

    expect(result).toEqual({ uuid: 'bbb', name: 'second' });
    expect(create).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it('routes to the create flow when the default name conflicts and the user chooses to create a new project', async () => {
    const list = jest.fn().mockResolvedValue([{ uuid: 'aaa', name: 'default-name' }]);
    const create = jest.fn().mockResolvedValue({ uuid: 'new', name: 'new-proj' });

    selectMock.mockResolvedValueOnce('create');
    inputMock.mockResolvedValueOnce('new-proj');

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const result = await promptForCommerceHostingProject(api, 'default-name');

    expect(result).toEqual({ uuid: 'new', name: 'new-proj' });
    expect(create).toHaveBeenCalledWith('new-proj');
    expect(inputMock.mock.calls[0]?.[0].default).toBe('default-name');
  });

  it('shows the conflict-aware message and three choices when a conflict exists', async () => {
    const list = jest.fn().mockResolvedValue([
      { uuid: 'aaa', name: 'My-Store' },
      { uuid: 'bbb', name: 'other-project' },
    ]);

    selectMock.mockResolvedValueOnce('create');
    inputMock.mockResolvedValueOnce('something-else');

    const create = jest.fn().mockResolvedValue({ uuid: 'new', name: 'something-else' });

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    // Default name matches case-insensitively — should surface the stored casing.
    await promptForCommerceHostingProject(api, 'my-store');

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
    const list = jest.fn().mockResolvedValue([conflict, { uuid: 'bbb', name: 'other-project' }]);
    const create = jest.fn();

    selectMock.mockResolvedValueOnce('use-named');

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const result = await promptForCommerceHostingProject(api, 'my-store');

    expect(result).toEqual(conflict);
    expect(selectMock).toHaveBeenCalledTimes(1);
    expect(create).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
  });

  it('shows all projects (including the conflict) and a "Create a new project" option in the list', async () => {
    const conflict = { uuid: 'aaa', name: 'My-Store' };
    const other = { uuid: 'bbb', name: 'other-project' };
    const list = jest.fn().mockResolvedValue([conflict, other]);
    const create = jest.fn();

    selectMock.mockResolvedValueOnce('select-from-list').mockResolvedValueOnce(other);

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const result = await promptForCommerceHostingProject(api, 'my-store');

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
    const list = jest.fn().mockResolvedValue([conflict, other]);
    const create = jest.fn().mockResolvedValue({ uuid: 'new', name: 'fresh-name' });

    selectMock.mockResolvedValueOnce('select-from-list').mockResolvedValueOnce('create-new');
    inputMock.mockResolvedValueOnce('fresh-name');

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const result = await promptForCommerceHostingProject(api, 'my-store');

    expect(result).toEqual({ uuid: 'new', name: 'fresh-name' });
    expect(create).toHaveBeenCalledWith('fresh-name');
  });

  it('omits Select from my projects when the conflict is the only existing project', async () => {
    const conflict = { uuid: 'aaa', name: 'My-Store' };
    const list = jest.fn().mockResolvedValue([conflict]);
    const create = jest.fn();

    selectMock.mockResolvedValueOnce('use-named');

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    await promptForCommerceHostingProject(api, 'my-store');

    // No "Select from my projects" — the conflict is the only project, and the message should
    // omit the now-irrelevant "select from your projects" phrase.
    expect(selectMock.mock.calls[0]?.[0].choices).toEqual([
      { name: 'Use "My-Store"', value: 'use-named' },
      { name: 'Create a new project', value: 'create' },
    ]);
    expect(selectMock.mock.calls[0]?.[0].message).toBe(
      'It looks like you already have an existing Commerce Hosting project named "My-Store". Would you like to use it, or create a new one?',
    );
  });

  it('offers each existing project as a choice in the second select call', async () => {
    const existing = [
      { uuid: 'aaa', name: 'first' },
      { uuid: 'bbb', name: 'second' },
    ];

    selectMock
      .mockResolvedValueOnce('select-from-list')
      .mockResolvedValueOnce({ uuid: 'aaa', name: 'first' });

    const api = makeCliApi({
      listInfrastructureProjects: jest.fn().mockResolvedValue(existing),
      createInfrastructureProject: jest.fn(),
    });

    await promptForCommerceHostingProject(api, 'first');

    const projectChoices = selectMock.mock.calls[1]?.[0].choices ?? [];

    expect(projectChoices[0]).toEqual({
      name: 'first',
      value: { uuid: 'aaa', name: 'first' },
      description: 'aaa',
    });
    expect(projectChoices[1]).toEqual({
      name: 'second',
      value: { uuid: 'bbb', name: 'second' },
      description: 'bbb',
    });
  });

  it('skips all prompts and creates with the supplied name when autoUseDefaultName is true', async () => {
    const list = jest.fn().mockResolvedValue([{ uuid: 'other', name: 'unrelated' }]);
    const create = jest.fn().mockResolvedValue({ uuid: 'u', name: 'auto-name' });

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const result = await promptForCommerceHostingProject(api, 'auto-name', true);

    expect(result).toEqual({ uuid: 'u', name: 'auto-name' });
    expect(list).toHaveBeenCalled();
    expect(selectMock).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith('auto-name');
  });

  it('returns the existing project when --project-name collides and the user picks Yes', async () => {
    const existing = { uuid: 'aaa', name: 'taken-name' };
    const list = jest.fn().mockResolvedValue([existing]);
    const create = jest.fn();

    selectMock.mockResolvedValueOnce(true);

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const restoreTty = withInteractiveTty();

    try {
      const result = await promptForCommerceHostingProject(api, 'taken-name', true);

      expect(result).toEqual(existing);
      expect(create).not.toHaveBeenCalled();
      expect(selectMock.mock.calls[0]?.[0].message).toMatch(
        /A Commerce Hosting project named "taken-name" already exists/,
      );
    } finally {
      restoreTty();
    }
  });

  it('reuses the existing project without prompting when --use-existing is passed', async () => {
    const existing = { uuid: 'aaa', name: 'taken-name' };
    const list = jest.fn().mockResolvedValue([existing]);
    const create = jest.fn();

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const result = await promptForCommerceHostingProject(api, 'taken-name', true, true);

    expect(result).toEqual(existing);
    expect(selectMock).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('exits without prompting in non-interactive environments when --use-existing is not passed', async () => {
    const list = jest.fn().mockResolvedValue([{ uuid: 'aaa', name: 'taken-name' }]);
    const create = jest.fn();

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const restoreTty = withNonInteractiveTty();

    try {
      await expect(promptForCommerceHostingProject(api, 'taken-name', true)).rejects.toThrow(
        'process.exit(1)',
      );

      expect(selectMock).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
    } finally {
      exitSpy.mockRestore();
      consoleSpy.mockRestore();
      restoreTty();
    }
  });

  it('detects --project-name collision case-insensitively and reports the stored name', async () => {
    const existing = { uuid: 'aaa', name: 'MyProject' };
    const list = jest.fn().mockResolvedValue([existing]);
    const create = jest.fn();

    selectMock.mockResolvedValueOnce(true);

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const restoreTty = withInteractiveTty();

    try {
      const result = await promptForCommerceHostingProject(api, 'myproject', true);

      expect(result).toEqual(existing);
      expect(create).not.toHaveBeenCalled();
      expect(selectMock.mock.calls[0]?.[0].message).toMatch(
        /A Commerce Hosting project named "MyProject" already exists/,
      );
    } finally {
      restoreTty();
    }
  });

  it('exits when --project-name collides and the user picks No', async () => {
    const list = jest.fn().mockResolvedValue([{ uuid: 'aaa', name: 'taken-name' }]);
    const create = jest.fn();

    selectMock.mockResolvedValueOnce(false);

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: create,
    });

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const restoreTty = withInteractiveTty();

    try {
      await expect(promptForCommerceHostingProject(api, 'taken-name', true)).rejects.toThrow(
        'process.exit(1)',
      );

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(create).not.toHaveBeenCalled();
      expect(consoleSpy.mock.calls.flat().join(' ')).toMatch(/Not reusing the existing project/);
    } finally {
      exitSpy.mockRestore();
      consoleSpy.mockRestore();
      restoreTty();
    }
  });

  it('exits the process when auto-create fails with a validation error instead of re-prompting', async () => {
    const create = jest
      .fn()
      .mockRejectedValueOnce(new InfrastructureProjectValidationError('Name already taken'));

    const api = makeCliApi({
      // Empty list so the client-side check passes and we hit the server-rejection path.
      listInfrastructureProjects: jest.fn().mockResolvedValue([]),
      createInfrastructureProject: create,
    });

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit(${String(code)})`);
    });

    await expect(promptForCommerceHostingProject(api, 'taken-name', true)).rejects.toThrow(
      'process.exit(1)',
    );

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(inputMock).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);

    exitSpy.mockRestore();
  });

  it('propagates errors from listInfrastructureProjects', async () => {
    const list = jest.fn().mockRejectedValue(new Error('network down'));

    const api = makeCliApi({
      listInfrastructureProjects: list,
      createInfrastructureProject: jest.fn(),
    });

    await expect(promptForCommerceHostingProject(api, 'whatever')).rejects.toThrow('network down');
    expect(selectMock).not.toHaveBeenCalled();
    expect(inputMock).not.toHaveBeenCalled();
  });
});

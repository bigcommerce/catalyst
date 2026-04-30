import { CliApi } from './cli-api';
import { InfrastructureProjectValidationError } from './cli-api-errors';

const fetchMock = jest.spyOn(globalThis, 'fetch');

beforeEach(() => {
  fetchMock.mockReset();
});

afterAll(() => {
  fetchMock.mockRestore();
});

function makeResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeCliApi() {
  return new CliApi({
    origin: 'https://cli.example',
    storeHash: 'abc',
    accessToken: 'token',
    apiHostname: 'api.example.com',
  });
}

describe('CliApi.checkProjectsAccess', () => {
  it('returns true on 200', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, { data: [] }));

    await expect(makeCliApi().hasProjectsAccess()).resolves.toBe(true);
  });

  it('returns false on 403', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(403, { detail: 'forbidden' }));

    await expect(makeCliApi().hasProjectsAccess()).resolves.toBe(false);
  });

  it('throws on 500 with status info in the message', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    await expect(makeCliApi().hasProjectsAccess()).rejects.toThrow(
      /GET \/v3\/infrastructure\/projects failed: 500 Internal Server Error/,
    );
  });

  it('throws on 401', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 401, statusText: 'Unauthorized' }),
    );

    await expect(makeCliApi().hasProjectsAccess()).rejects.toThrow(/401 Unauthorized/);
  });

  it('propagates network errors from fetch', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network unreachable'));

    await expect(makeCliApi().hasProjectsAccess()).rejects.toThrow('network unreachable');
  });

  it('calls the correct URL with the auth token', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, { data: [] }));

    await makeCliApi().hasProjectsAccess();

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);

    expect(url).toBe('https://api.example.com/stores/abc/v3/infrastructure/projects');
    expect(init?.method).toBe('GET');
    expect(headers.get('X-Auth-Token')).toBe('token');
  });
});

describe('CliApi.listInfrastructureProjects', () => {
  it('returns the project list on success', async () => {
    fetchMock.mockResolvedValueOnce(
      makeResponse(200, {
        data: [
          { uuid: 'a', name: 'first' },
          { uuid: 'b', name: 'second' },
        ],
      }),
    );

    await expect(makeCliApi().listInfrastructureProjects()).resolves.toEqual([
      { uuid: 'a', name: 'first' },
      { uuid: 'b', name: 'second' },
    ]);
  });

  it('returns an empty array when the store has no projects yet', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, { data: [] }));

    await expect(makeCliApi().listInfrastructureProjects()).resolves.toEqual([]);
  });

  it('throws a wrapped error on non-OK responses', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    await expect(makeCliApi().listInfrastructureProjects()).rejects.toThrow(
      /Could not load Commerce Hosting projects: 500 Internal Server Error/,
    );
  });

  it('wraps schema-parse failures in the same friendly error', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, { data: [{ uuid: 'only-uuid' }] }));

    await expect(makeCliApi().listInfrastructureProjects()).rejects.toThrow(
      /Could not load Commerce Hosting projects:/,
    );
  });

  it('wraps network/fetch failures in the same friendly error', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(makeCliApi().listInfrastructureProjects()).rejects.toThrow(
      /Could not load Commerce Hosting projects: fetch failed/,
    );
  });

  it('preserves the original error as cause for debugging', async () => {
    const original = new TypeError('fetch failed');

    fetchMock.mockRejectedValueOnce(original);

    await expect(makeCliApi().listInfrastructureProjects()).rejects.toMatchObject({
      cause: original,
    });
  });
});

describe('CliApi.createInfrastructureProject', () => {
  it('returns the project data on success', async () => {
    fetchMock.mockResolvedValueOnce(
      makeResponse(200, { data: { uuid: 'proj-uuid', name: 'my-project' } }),
    );

    await expect(makeCliApi().createInfrastructureProject('my-project')).resolves.toEqual({
      uuid: 'proj-uuid',
      name: 'my-project',
    });
  });

  it('POSTs the name as JSON', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, { data: { uuid: 'u', name: 'my-project' } }));

    await makeCliApi().createInfrastructureProject('my-project');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'my-project' }),
      }),
    );
  });

  it('throws InfrastructureProjectValidationError on 422 with errors map', async () => {
    fetchMock.mockResolvedValueOnce(
      makeResponse(422, {
        title: 'Validation failed',
        errors: { name: 'Name must be 3-32 characters' },
      }),
    );

    const error = await makeCliApi()
      .createInfrastructureProject('x')
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(InfrastructureProjectValidationError);

    if (!(error instanceof Error)) throw new Error('expected thrown Error');

    expect(error.message).toBe('Name must be 3-32 characters');
  });

  it('joins multiple field errors with semicolons', async () => {
    fetchMock.mockResolvedValue(
      makeResponse(422, {
        errors: { name: 'Name is invalid', slug: 'Slug already exists' },
      }),
    );

    await expect(makeCliApi().createInfrastructureProject('x')).rejects.toThrow(
      'Name is invalid; Slug already exists',
    );
  });

  it('falls back to `detail` when no errors map is present', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(422, { detail: 'Detailed failure' }));

    await expect(makeCliApi().createInfrastructureProject('x')).rejects.toThrow('Detailed failure');
  });

  it('falls back to `title` when neither errors nor detail is present', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(422, { title: 'Bad request' }));

    await expect(makeCliApi().createInfrastructureProject('x')).rejects.toThrow('Bad request');
  });

  it('falls back to statusText when body is unparseable', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('not json', { status: 422, statusText: 'Unprocessable Entity' }),
    );

    await expect(makeCliApi().createInfrastructureProject('x')).rejects.toThrow(
      'Unprocessable Entity',
    );
  });

  it('also treats 400 as a validation error', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(400, { detail: 'Bad input' }));

    await expect(makeCliApi().createInfrastructureProject('x')).rejects.toBeInstanceOf(
      InfrastructureProjectValidationError,
    );
  });

  it('wraps non-validation non-OK statuses in a friendly error', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 500, statusText: 'Internal Server Error' }),
    );

    const promise = makeCliApi().createInfrastructureProject('x');

    await expect(promise).rejects.not.toBeInstanceOf(InfrastructureProjectValidationError);
    await expect(promise).rejects.toThrow(
      /Could not create Commerce Hosting project: 500 Internal Server Error/,
    );
  });

  it('wraps schema-parse failures in the same friendly error', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, { data: { uuid: 'only-uuid' } }));

    await expect(makeCliApi().createInfrastructureProject('x')).rejects.toThrow(
      /Could not create Commerce Hosting project:/,
    );
  });

  it('wraps network/fetch failures in the same friendly error', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));

    await expect(makeCliApi().createInfrastructureProject('x')).rejects.toThrow(
      /Could not create Commerce Hosting project: fetch failed/,
    );
  });

  it('preserves InfrastructureProjectValidationError as-is (not wrapped)', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(422, { detail: 'Name already taken' }));

    const promise = makeCliApi().createInfrastructureProject('x');

    await expect(promise).rejects.toBeInstanceOf(InfrastructureProjectValidationError);
    await expect(promise).rejects.toThrow('Name already taken');
  });
});

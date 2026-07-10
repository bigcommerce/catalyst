import { checkbox, input, select } from '@inquirer/prompts';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { createChannel } from './channels';
import { getChannelNameError, runCreateChannelFlow } from './create-channel-flow';
import { UserActionableError } from './errors';
import { getAvailableLocales } from './localization';

vi.mock('@inquirer/prompts', () => ({
  input: vi.fn(),
  select: vi.fn(),
  checkbox: vi.fn(),
}));

vi.mock('./channels', () => ({
  createChannel: vi.fn(),
}));

vi.mock('./localization', () => ({
  getAvailableLocales: vi.fn(),
}));

const mockInput = vi.mocked(input);
const mockSelect = vi.mocked(select);
const mockCheckbox = vi.mocked(checkbox);
const mockCreateChannel = vi.mocked(createChannel);
const mockGetAvailableLocales = vi.mocked(getAvailableLocales);

const baseOptions = {
  storeHash: 'test-store',
  accessToken: 'test-token',
  apiHost: 'api.bigcommerce.com',
  cliApiOrigin: 'https://cxm-prd.bigcommerceapp.com',
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('getChannelNameError', () => {
  test.each([
    ['My Store', 'a plain name'],
    ['My-Store_2', 'hyphens and underscores'],
    ['Café Münchën', 'accented / non-ASCII letters'],
    ['   Padded   ', 'surrounding whitespace'],
  ])('accepts %j (%s)', (name) => {
    expect(getChannelNameError(name)).toBeUndefined();
  });

  test.each([
    ["Bob's Store", 'an apostrophe'],
    ['Store & Co', 'an ampersand'],
    ['Store #1', 'a hash'],
    ['Store (US)', 'parentheses'],
  ])('rejects %j (%s) with an actionable message', (name) => {
    const error = getChannelNameError(name);

    expect(error).toContain(name);
    expect(error).toContain('not a valid channel name');
    expect(error).toContain('letters, numbers, spaces, hyphens (-), and underscores (_)');
  });

  test.each([
    ['', 'an empty string'],
    ['   ', 'only whitespace'],
  ])('rejects %j (%s) as empty', (name) => {
    expect(getChannelNameError(name)).toBe('Channel name cannot be empty.');
  });
});

describe('runCreateChannelFlow', () => {
  test('throws UserActionableError for an invalid --name before calling the API', async () => {
    await expect(runCreateChannelFlow({ ...baseOptions, name: "Bob's Store" })).rejects.toThrow(
      UserActionableError,
    );

    await expect(
      runCreateChannelFlow({ ...baseOptions, name: "Bob's Store" }),
    ).rejects.toThrow(/not a valid channel name/);

    expect(mockCreateChannel).not.toHaveBeenCalled();
    expect(mockInput).not.toHaveBeenCalled();
  });

  test('validates the interactive name prompt with getChannelNameError', async () => {
    mockInput.mockResolvedValue('My Store');
    mockSelect
      .mockResolvedValueOnce('en') // default locale
      .mockResolvedValueOnce(false) // add additional languages?
      .mockResolvedValueOnce(false); // install sample data?
    mockGetAvailableLocales.mockResolvedValue([{ name: 'English', value: 'en' }]);
    mockCreateChannel.mockResolvedValue({
      channelId: 42,
      storefrontToken: 'token',
      envVars: {},
    });

    await runCreateChannelFlow(baseOptions);

    const validate = mockInput.mock.calls[0]?.[0]?.validate;

    expect(validate).toBeTypeOf('function');
    expect(validate?.("Bob's Store")).toBe(
      '"Bob\'s Store" is not a valid channel name. Channel names may contain only letters, numbers, spaces, hyphens (-), and underscores (_).',
    );
    expect(validate?.('My Store')).toBe(true);
  });

  test('passes a valid --name straight through to createChannel', async () => {
    mockCreateChannel.mockResolvedValue({
      channelId: 42,
      storefrontToken: 'token',
      envVars: {},
    });

    await runCreateChannelFlow({
      ...baseOptions,
      name: 'My Store',
      locale: 'en',
      additionalLocales: [],
      sampleData: false,
    });

    expect(mockInput).not.toHaveBeenCalled();
    expect(mockSelect).not.toHaveBeenCalled();
    expect(mockCheckbox).not.toHaveBeenCalled();
    expect(mockCreateChannel).toHaveBeenCalledWith(
      'My Store',
      'en',
      [],
      false,
      baseOptions.storeHash,
      baseOptions.accessToken,
      baseOptions.cliApiOrigin,
    );
  });
});

import { input } from '@inquirer/prompts';
import open from 'open';
import { afterEach, beforeAll, beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';

import * as authLib from './auth';
import * as clipboardLib from './clipboard';
import { consola } from './logger';
import { login } from './login';

// eslint-disable-next-line import/dynamic-import-chunkname
vi.mock('yocto-spinner', () => import('../../../tests/mocks/spinner'));
vi.mock('open', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
  input: vi.fn(),
  password: vi.fn(),
}));

const inputMock = vi.mocked(input);
const openMock = vi.mocked(open);

const LOGIN_URL = 'https://login.example.com';
const API_HOST = 'api.example.com';

const DEVICE_CODE = {
  device_code: 'device-code',
  user_code: 'USER-CODE',
  verification_uri: 'https://login.example.com/device',
  expires_in: 600,
  interval: 5,
};

const CREDENTIALS = {
  access_token: 'access-token',
  store_hash: 'store-hash',
  context: 'stores/store-hash',
  api_uri: 'https://api.example.com',
};

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

let copyToClipboardSpy: MockInstance<typeof clipboardLib.copyToClipboard>;
let restoreTty: (() => void) | undefined;

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

beforeEach(() => {
  vi.spyOn(authLib, 'requestDeviceCode').mockResolvedValue(DEVICE_CODE);
  vi.spyOn(authLib, 'waitForDeviceToken').mockResolvedValue(CREDENTIALS);
  copyToClipboardSpy = vi.spyOn(clipboardLib, 'copyToClipboard').mockResolvedValue(true);
});

afterEach(() => {
  restoreTty?.();
  restoreTty = undefined;
  vi.clearAllMocks();
});

describe('device-code login', () => {
  test('waits for Enter before opening the browser when interactive', async () => {
    restoreTty = withTtyValue(true);

    // The browser must not open until the user has pressed Enter, so assert it
    // hasn't been called yet at the moment we prompt.
    inputMock.mockImplementationOnce(() => {
      expect(openMock).not.toHaveBeenCalled();

      return Promise.resolve('');
    });

    const result = await login(LOGIN_URL, API_HOST);

    expect(inputMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Press Enter to open your browser and sign in' }),
    );
    expect(openMock).toHaveBeenCalledWith(DEVICE_CODE.verification_uri);
    expect(result).toEqual({ storeHash: 'store-hash', accessToken: 'access-token' });
  });

  test('copies the code to the clipboard once the user proceeds', async () => {
    restoreTty = withTtyValue(true);
    inputMock.mockResolvedValueOnce('');
    copyToClipboardSpy.mockResolvedValueOnce(true);

    await login(LOGIN_URL, API_HOST);

    expect(copyToClipboardSpy).toHaveBeenCalledWith('USER-CODE');
    expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('clipboard'));
  });

  test('still completes and prints the code when the clipboard copy fails', async () => {
    restoreTty = withTtyValue(true);
    inputMock.mockResolvedValueOnce('');
    copyToClipboardSpy.mockResolvedValueOnce(false);

    const result = await login(LOGIN_URL, API_HOST);

    // Code was printed as a fallback, but no clipboard confirmation shown.
    expect(consola.info).toHaveBeenCalledWith(expect.stringContaining('USER-CODE'));
    expect(consola.info).not.toHaveBeenCalledWith(expect.stringContaining('clipboard'));
    expect(openMock).toHaveBeenCalledWith(DEVICE_CODE.verification_uri);
    expect(result).toEqual({ storeHash: 'store-hash', accessToken: 'access-token' });
  });

  test('does not wait for Enter or touch the clipboard when non-interactive', async () => {
    restoreTty = withTtyValue(false);

    const result = await login(LOGIN_URL, API_HOST);

    expect(inputMock).not.toHaveBeenCalled();
    expect(copyToClipboardSpy).not.toHaveBeenCalled();
    expect(openMock).toHaveBeenCalledWith(DEVICE_CODE.verification_uri);
    expect(result).toEqual({ storeHash: 'store-hash', accessToken: 'access-token' });
  });
});

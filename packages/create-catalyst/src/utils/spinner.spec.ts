import { oraPromise } from 'ora';

import { spinner } from './spinner';

jest.mock('ora', () => ({
  oraPromise: jest.fn().mockResolvedValue('Result'),
}));

describe('spinner', () => {
  it('should call oraPromise with the provided action', async () => {
    const mockAction = jest.fn();

    await spinner(mockAction, { text: 'Loading', successText: 'Loaded' });

    expect(oraPromise).toHaveBeenCalledWith(mockAction, {
      spinner: 'triangle',
      text: 'Loading',
      successText: 'Loaded',
    });
  });

  it('should return the resolved value of the action', async () => {
    const mockAction = jest.fn().mockResolvedValue('Result');

    const result = await spinner(mockAction, { text: 'Loading', successText: 'Loaded' });

    expect(result).toBe('Result');
  });
});

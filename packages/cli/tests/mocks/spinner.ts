import { vi } from 'vitest';

const spinnerMock = {
  text: 'Loading…',
  start() {
    return this;
  },
  success: vi.fn(),
  error: vi.fn(),
};

const textHistory: string[] = [];

export default function yoctoSpinner({ text }: { text: string }) {
  spinnerMock.text = text;
  textHistory.push(text);
  Object.defineProperty(spinnerMock, 'text', {
    set(val: string) {
      textHistory.push(val);
    },
    get() {
      return textHistory[textHistory.length - 1];
    },
    configurable: true,
  });

  return spinnerMock;
}

export { textHistory };

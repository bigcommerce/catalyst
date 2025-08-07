import { vi } from 'vitest';

export const textHistory: string[] = [];

export default vi.fn().mockImplementation(({ text }: { text?: string } = {}) => {
  if (text) textHistory.push(text);

  const spinner = {
    _text: text ?? '',
    start: vi.fn().mockImplementation((methodText?: string) => {
      if (methodText) textHistory.push(methodText);

      return spinner;
    }),
    stop: vi.fn().mockImplementation((methodText?: string) => {
      if (methodText) textHistory.push(methodText);

      return spinner;
    }),
    success: vi.fn().mockImplementation((methodText?: string) => {
      if (methodText) textHistory.push(methodText);

      return spinner;
    }),
    error: vi.fn().mockImplementation((methodText?: string) => {
      if (methodText) textHistory.push(methodText);

      return spinner;
    }),
    warning: vi.fn().mockImplementation((methodText?: string) => {
      if (methodText) textHistory.push(methodText);

      return spinner;
    }),
    info: vi.fn().mockImplementation((methodText?: string) => {
      if (methodText) textHistory.push(methodText);

      return spinner;
    }),
    get text() {
      return this._text;
    },
    set text(value: string) {
      this._text = value;
      textHistory.push(value);
    },
  };

  return spinner;
});

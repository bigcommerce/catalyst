import { vi } from 'vitest';

export const textHistory: string[] = [];

export default vi.fn().mockImplementation(({ text }: { text: string }) => {
  textHistory.push(text);

  return {
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
    set text(value: string) {
      textHistory.push(value);
    },
    get text() {
      return textHistory[textHistory.length - 1] || '';
    },
  };
});

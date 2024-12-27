export class CatalystError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'CatalystError';
  }
}

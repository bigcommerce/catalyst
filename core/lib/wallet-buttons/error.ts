export class InitializationError extends Error {
  constructor() {
    super(
      'Unable to initialize the checkout button because the required script has not been loaded yet.',
    );

    this.name = 'InitializationError';
  }
}

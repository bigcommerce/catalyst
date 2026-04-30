export class InfrastructureProjectValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InfrastructureProjectValidationError';
  }
}

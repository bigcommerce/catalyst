import { CatalystError } from './catalyst-error';

export class DependencyError extends CatalystError {
  constructor(message: string) {
    super(message, 'DEPENDENCY_ERROR');
    this.name = 'DependencyError';
  }
}

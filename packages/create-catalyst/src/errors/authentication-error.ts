import { CatalystError } from './catalyst-error';

export class AuthenticationError extends CatalystError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

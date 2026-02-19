import { Data } from 'effect';

export class MissingCredentialsError extends Data.TaggedError('MissingCredentialsError')<{
  readonly message: string;
}> {}

export class HttpApiError extends Data.TaggedError('HttpApiError')<{
  readonly message: string;
  readonly status?: number;
  readonly statusText?: string;
}> {}

export class DeploymentError extends Data.TaggedError('DeploymentError')<{
  readonly message: string;
  readonly code?: number;
}> {}

export class BundleError extends Data.TaggedError('BundleError')<{
  readonly message: string;
}> {}

export class BuildError extends Data.TaggedError('BuildError')<{
  readonly message: string;
}> {}

export class AuthError extends Data.TaggedError('AuthError')<{
  readonly message: string;
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly message: string;
}> {}

export class ProcessRunnerError extends Data.TaggedError('ProcessRunnerError')<{
  readonly message: string;
  readonly exitCode?: number;
}> {}

export class BrowserOpenError extends Data.TaggedError('BrowserOpenError')<{
  readonly message: string;
}> {}

export class ZipError extends Data.TaggedError('ZipError')<{
  readonly message: string;
}> {}

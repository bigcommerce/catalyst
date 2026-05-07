import { ExecException } from 'node:child_process';

export function isExecException(error: unknown): error is ExecException {
  return typeof error === 'object' && error !== null && 'stdout' in error && 'stderr' in error;
}

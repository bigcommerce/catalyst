import { type Ora, oraPromise, type PromiseOptions } from 'ora';

export const spinner = async <T>(
  action: PromiseLike<T> | ((spinner: Ora) => PromiseLike<T>),
  oraOpts: PromiseOptions<T>,
) => {
  return oraPromise(action, {
    spinner: 'triangle',
    ...oraOpts,
  }).catch(() => process.exit(1));
};

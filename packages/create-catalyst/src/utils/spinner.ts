import { type Ora, oraPromise, type PromiseOptions } from 'ora';

const spinnerIcon = 'triangle' as const;

export const spinner = async <T>(
  action: PromiseLike<T> | ((spinner: Ora) => PromiseLike<T>),
  oraOpts: PromiseOptions<T>,
) => {
  return oraPromise(action, {
    spinner: spinnerIcon,
    ...oraOpts,
  }).catch(() => process.exit(1));
};

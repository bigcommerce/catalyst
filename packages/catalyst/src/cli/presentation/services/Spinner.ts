import { Context, Effect, Layer } from 'effect';
import yoctoSpinner, { type Spinner as YoctoSpinner } from 'yocto-spinner';

export class Spinner extends Context.Tag('@catalyst/Spinner')<
  Spinner,
  {
    readonly start: (text: string) => Effect.Effect<void>;
    readonly success: (text: string) => Effect.Effect<void>;
    readonly error: (text: string) => Effect.Effect<void>;
    readonly setText: (text: string) => Effect.Effect<void>;
  }
>() {}

export const SpinnerLive = Layer.sync(Spinner, () => {
  let spinner: YoctoSpinner | undefined;

  return {
    start: (text) =>
      Effect.sync(() => {
        spinner = yoctoSpinner({ text }).start();
      }),
    success: (text) =>
      Effect.sync(() => {
        if (spinner) {
          spinner.success(text);
          spinner = undefined;
        }
      }),
    error: (text) =>
      Effect.sync(() => {
        if (spinner) {
          spinner.error(text);
          spinner = undefined;
        }
      }),
    setText: (text) =>
      Effect.sync(() => {
        if (spinner) {
          spinner.text = text;
        }
      }),
  };
});

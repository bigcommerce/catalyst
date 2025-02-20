import { render } from '@testing-library/react';
import userEvent, { Options } from '@testing-library/user-event';
import { ReactElement } from 'react';

export function setupUserEvent(jsx: ReactElement, setupOptions?: Options) {
  return {
    user: userEvent.setup(setupOptions),
    ...render(jsx),
  };
}

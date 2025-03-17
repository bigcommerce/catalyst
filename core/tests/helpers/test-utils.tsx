import { render } from '@testing-library/react';
import { Providers } from '~/app/providers';
import { ReactNode } from 'react';

export const customRender = (ui: ReactNode, options = {}) =>
  render(<Providers>{ui}</Providers>, { ...options });

export * from '@testing-library/react';
export { customRender as render };

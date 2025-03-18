import { render } from '@testing-library/react';
import { Providers } from '~/app/providers';
import { NextIntlProvider } from 'next-intl';
import { ReactNode } from 'react';

export const customRender = (ui: ReactNode, options = {}) =>
  render(
    <NextIntlProvider locale="en" messages={{}}>
      <Providers>{ui}</Providers>
    </NextIntlProvider>,
    { ...options }
  );

export * from '@testing-library/react';
export { customRender as render };
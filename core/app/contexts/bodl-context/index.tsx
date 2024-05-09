import { createContext, PropsWithChildren, useContext } from 'react';
import { Bodl, Ga4 } from '@bigcommerce/bodl';

const ga4 = new Ga4({
  // TODO: Replace with actual store configuration
  gaId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? '',
  developerId: 0,
  consentModeEnabled: false,
});

const bodl = new Bodl([ga4], { channel_id: process.env.BIGCOMMERCE_CHANNEL_ID ?? '1' });

const BodlContext = createContext<Bodl | null>(null);

export const BodlProvider = ({ children }: PropsWithChildren) => {
  return <BodlContext.Provider value={bodl}>{children}</BodlContext.Provider>;
};

export const useBodl = () => {
  const _bodl = useContext(BodlContext);

  if (!_bodl) {
    throw new Error('No analytics provider found');
  }

  return _bodl;
};

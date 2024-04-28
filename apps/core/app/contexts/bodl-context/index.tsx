import { createContext, PropsWithChildren, useContext } from 'react';
import { BODL, GA4 } from '@bigcommerce/bodl';

const ga4: GA4 = {
  // TODO: Add GA4 configuration
};

const bodl = new BODL({ providers: [ga4] });

const BodlContext = createContext<BODL | null>(null);

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

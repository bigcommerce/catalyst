export interface B2BProductOption {
  optionEntityId: number;
  optionValueEntityId: number;
  entityId: number;
  valueEntityId: number;
  text: string;
  number: number;
  date:
    | {
        utc: string;
      }
    | undefined;
}

declare global {
  interface Window {
    b2b?: {
      utils?: {
        openPage: (page: string) => void;
        user: {
          loginWithB2BStorefrontToken: (token: string) => Promise<void>;
          getB2BToken: () => string;
        };
        quote?: {
          addProducts: (
            products: Array<{
              sku: string;
              productEntityId: number;
              quantity?: number;
              selectedOptions?: B2BProductOption[];
            }>,
          ) => Promise<void>;
        };
      };
      callbacks?: {
        addEventListener: (event: 'on-logout' | 'on-registered', callback: (props: { data: Record<string,string> }) => void) => void;
        removeEventListener: (event: 'on-logout' | 'on-registered', callback: (props: { data: Record<string,string> }) => void) => void;
        dispatchEvent: (event: string) => void;
      };
    };
  }
}

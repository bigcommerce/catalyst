export interface B2BProductOption {
  optionEntityId: number;
  optionValueEntityId: number;
  entityId: number;
  valueEntityId: number;
  text: string;
  number: number;
  date?: {
    utc: string;
  };
}

export interface QuoteConfigProps {
  key: string;
  value: string;
  extraFields: Record<string, string>;
}

export enum B2BRole {
  ADMIN = 0,
  SENIOR_BUYER = 1,
  JUNIOR_BUYER = 2,
  SUPER_ADMIN = 3,
  SUPER_ADMIN_BEFORE_AGENCY = 4,
  CUSTOM_ROLE = 5,
  B2C = 99,
  GUEST = 100,
}

export interface B2BProfile {
  id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  customerGroupId: number;
  role: number;
  userType: number;
  loginType: number;
  companyRoleName: string;
}

declare global {
  interface Window {
    b2b?: {
      utils?: {
        openPage: (page: string) => void;
        user: {
          loginWithB2BStorefrontToken: (token: string) => Promise<void>;
          getProfile: () => B2BProfile;
          getB2BToken: () => string;
        };
        quote?: {
          getQuoteConfigs: () => QuoteConfigProps[];
          addProductsFromCartId: (cartId: string) => Promise<void>;
          addProducts: (
            products: Array<{
              sku: string;
              productEntityId: number;
              quantity?: number;
              selectedOptions?: B2BProductOption[];
            }>,
          ) => Promise<void>;
        };
        shoppingList?: {
          addProductFromPage: (product: {
            sku: string;
            productEntityId: number;
            quantity?: number;
            selectedOptions?: B2BProductOption[];
          }) => Promise<void>;
        };
        cart?: {
          getEntityId: () => string;
          setEntityId: (cartId: string) => void;
        }
      };
      callbacks?: {
        addEventListener: {
          (
            event: 'on-registered',
            callback: (props: {
              data: Record<'email' | 'password' | 'landingLoginLocation', string>;
            }) => void,
          ): void;
          (event: 'on-logout', callback: (props: { data: Record<string, string> }) => void): void;
          (event: 'on-cart-created', callback: (props: { data: { cartId: string } }) => void): void;
        };
        removeEventListener: (event: 'on-logout' | 'on-registered' | 'on-cart-created', callback: unknown) => void;
        dispatchEvent: (event: string) => void;
      };
    };
  }
}

import type { CSSProperties } from 'react';

declare global {
  interface AccountPaymentsState {
    code: string;
    name: string;
    value: string;
  }

  interface AccountPaymentsCountry {
    code: string;
    label: string;
    states?: AccountPaymentsState[];
    value: string;
  }

  type PaymentProviderInitializationData = unknown;

  interface HeadlessStoreContextDataInterface {
    countries: AccountPaymentsCountry[];
    paymentsUrl: string;
    storeHash: string;
    storeLocale: string;
    vaultToken: string;
    shopperId: string;
    customerEmail: string;
    currencyCode: string;
    paymentMethodsUrl: string;
    paymentProviderInitializationData?: PaymentProviderInitializationData;
    paymentMethodId: string;
    storefrontApiBaseUrl: string;
  }

  interface AccountPaymentsAppStyles {
    inputBase?: CSSProperties;
    inputValidationError?: CSSProperties;
    inputValidationSuccess?: CSSProperties;
    submitButton?: CSSProperties;
    cancelButton?: CSSProperties;
    label?: CSSProperties;
    inputWrapper?: CSSProperties;
    validationError?: CSSProperties;
    heading?: CSSProperties;
    formRow?: CSSProperties;
    formActions?: CSSProperties;
  }

  interface RenderAccountPaymentsArgs {
    storeContextData: HeadlessStoreContextDataInterface;
    styles: AccountPaymentsAppStyles;
    errorHandler: (message: string) => void;
  }

  interface BigCommerceGlobal {
    renderAccountPayments: (args: RenderAccountPaymentsArgs) => void;
  }

  interface Window {
    BigCommerce?: BigCommerceGlobal;
  }
}

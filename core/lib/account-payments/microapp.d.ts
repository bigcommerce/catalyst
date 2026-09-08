import type { CSSProperties } from 'react';

declare global {
  interface State {
    code: string;
    name: string;
    value: string;
  }

  interface Country {
    code: string;
    label: string;
    states?: State[];
    value: string;
  }

  type PaymentProviderInitializationData = unknown;

  interface HeadlessStoreContextDataInterface {
    countries: Country[];
    paymentsUrl: string;
    storeHash: string;
    storeLocale: string;
    vaultToken: string;
    shopperId: string;
    customerEmail: string;
    currencyCode: string;
    paymentMethodsUrl: string;
    paymentProviderInitializationData: PaymentProviderInitializationData;
    paymentMethodId: string;
    storefrontApiBaseUrl: string;
  }

  interface AppStyles {
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
    styles: AppStyles;
    errorHandler: (message: string) => void;
  }

  interface BigCommerceGlobal {
    renderAccountPayments: (args: RenderAccountPaymentsArgs) => void;
  }

  interface Window {
    BigCommerce?: BigCommerceGlobal;
  }
}

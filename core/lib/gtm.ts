export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-KGQLWDKB';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

// Track Page Views
export const pageview = (url: string): void => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'pageview',
      page: url,
    });
  }
};

// Track Custom Events
interface EventProps {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
}

export const event = ({ event, category, action, label, value }: EventProps): void => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event,
      category,
      action,
      label,
      value,
    });
  }
};

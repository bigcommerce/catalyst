declare global {
  interface Window {
    klaviyo?: KlaviyoEvent[];
  }
}

type KlaviyoEvent =
  | [eventType: 'identify', item: Record<string, unknown>]
  | [eventType: 'trackViewedItem', item: Record<string, unknown>]
  | [eventType: 'track', eventName: string, item: Record<string, unknown>];

export function KlaviyoIdentifyUser({ user }: { user?: { email: string, first_name?: string, last_name?: string, phone_number?: string, city?: string, region?: string, country?: string, zip?: string } }) {
  const klaviyo = window.klaviyo || [];

  klaviyo.push(['identify', user && user.email ? user : { anonymous: true }]);
}
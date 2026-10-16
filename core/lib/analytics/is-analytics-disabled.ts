// Turns off every analytics integration: BigCommerce analytics events and
// their visit cookies, Google Analytics, and Vercel Analytics/Speed Insights.
export const isAnalyticsDisabled = () => process.env.DISABLE_ANALYTICS === 'true';

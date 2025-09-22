import { statsigAdapter, type StatsigUser } from '@flags-sdk/statsig';
import { dedupe, flag } from 'flags/next';

const statsigSecret = process.env.STATSIG_SERVER_SECRET;
const statsigEnabled = statsigSecret && statsigSecret !== 'disabled';

export const identify = dedupe(() =>
  Promise.resolve({
    // implement the identify() function to add any additional user properties you'd like, see docs.statsig.com/concepts/user
    userID: '1234', // for example, set userID
  } satisfies StatsigUser),
);

export const createFeatureFlag = (key: string, fallback = false) => {
  if (!statsigEnabled) {
    return async () => fallback;
  }

  return flag<boolean, StatsigUser>({
    key,
    adapter: statsigAdapter.featureGate((gate) => gate.value, {
      exposureLogging: true,
    }),
    identify,
  });
};

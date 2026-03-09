import { type NextProxy, NextResponse } from 'next/server';

export type ProxyFactory = (proxy: NextProxy) => NextProxy;

export const composeProxies = (
  firstProxyWrapper: ProxyFactory,
  ...otherProxyWrappers: ProxyFactory[]
): NextProxy => {
  const proxies = otherProxyWrappers.reduce(
    (accumulatedProxies, nextProxy) => (proxy) => accumulatedProxies(nextProxy(proxy)),
    firstProxyWrapper,
  );

  return proxies(() => {
    return NextResponse.next();
  });
};

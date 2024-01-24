import { nodeVersion, process, provider, runtime } from 'std-env';

import packageInfo from '../../package.json';

const { name, version } = packageInfo;

/*
 Attempt to detect hosting platform and environment information to add to user agent
*/
const getPlatform = () => {
  const keysOfInterest = [runtime, provider, nodeVersion, process.env.NODE_ENV].filter(Boolean);

  return keysOfInterest.join('; ');
};

const detectedPlatform = getPlatform();

/*
    Construct a User-Agent header value for use in API requests to BigCommerce.
    Reference https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent
    for more information on the conventions used here.
*/
export const getBackendUserAgent = (platform?: string, extensions?: string): string => {
  // Version of this client which is directly making the request
  const userAgentParts = [`${name}/${version}`];

  // Used for host information
  const platformValue = platform || detectedPlatform;

  userAgentParts.push(`(${platformValue})`);

  // Used for any extensions such as framework or plugin versions,
  // assumed to already be in a valid user-agent format
  if (extensions) {
    userAgentParts.push(extensions);
  }

  return userAgentParts.join(' ');
};

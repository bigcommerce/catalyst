import {
  isDevelopment,
  isLinux,
  isMacOS,
  isProduction,
  isTest,
  isWindows,
  nodeVersion,
  process,
  provider,
  runtime,
} from 'std-env';

import packageInfo from '../../package.json';

const { name, version } = packageInfo;

const getOS = () => {
  if (isWindows) return 'Windows';
  if (isMacOS) return 'macOS';
  if (isLinux) return 'Linux';

  return 'Unknown OS';
};

const getEnv = () => {
  if (isDevelopment) return 'Development';
  if (isTest) return 'Test';
  if (isProduction) return 'Production';

  return 'Unknown Env';
};

const getPlatform = () => {
  const os = getOS();
  const env = getEnv();

  const keysOfInterest = [
    os,
    env,
    runtime,
    provider,
    `Node ${nodeVersion}`,
    process.env.NODE_ENV,
  ].filter(Boolean);

  return keysOfInterest.join('; ');
};

const detectedPlatform = getPlatform();

export const getCLIUserAgent = (platform?: string, extensions?: string): string => {
  const userAgentParts = [`${name}/${version}`];

  const platformValue = platform ?? detectedPlatform;

  userAgentParts.push(`(${platformValue})`);

  if (extensions) {
    userAgentParts.push(extensions);
  }

  return userAgentParts.join(' ');
};

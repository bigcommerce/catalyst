import packageInfo from './package.json';

const { name, version } = packageInfo;

// Add package name and version to the user agent
// Used as part of API client instantiation
export const backendUserAgent = `${name}/${version}`;

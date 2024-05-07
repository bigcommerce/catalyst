import packageInfo from './package.json';
const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

const { name, version } = packageInfo;

// Add package name and version to the user agent
// Used as part of API client instantiation
export const backendUserAgent = `${name}/${version}${commitSha ? ` (${commitSha})` : ''}`;

import packageInfo from './package.json';
<<<<<<< HEAD:core/userAgent.ts
const commitSha = process.env.NEXT_PUBLIC__GIT_COMMIT_SHA;
=======

const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
>>>>>>> e30002761ea45394d40b6a47ad4910c45b5e1e8f:core/user-agent.ts

const { name, version } = packageInfo;

// Add package name and version to the user agent
// Used as part of API client instantiation
export const backendUserAgent = `${name}/${version}${commitSha ? ` (${commitSha})` : ''}`;

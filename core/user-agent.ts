import packageInfo from './package.json';

const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

const { name } = packageInfo;

// Prefer the dedicated `catalyst.version` field, which always reflects the true
// Catalyst release even if a merchant repurposes the top-level `version` (Docker
// labels, deploy tags, etc.). The `?? version` fallback is intentional for
// projects whose package.json predates the `catalyst` field. TypeScript infers
// `catalyst` as always-present from this repo's package.json (so it flags the
// guard as unnecessary), but it can be absent at runtime in older projects.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const catalystVersion = packageInfo.catalyst?.version ?? packageInfo.version;

// Add package name and version to the user agent
// Used as part of API client instantiation
export const backendUserAgent = `${name}/${catalystVersion}${commitSha ? ` (${commitSha})` : ''}`;

/**
 * Product videos come from the Storefront GraphQL API as a YouTube watch URL
 * (e.g. `https://www.youtube.com/watch?v=...`). The `<lite-youtube>` player
 * (see ./lite-youtube) needs the bare video id, and the Videos section thumbnail
 * needs a poster image — both are derived here. The embedding itself (iframe, facade,
 * autoplay) is handled by the lite-youtube-embed library.
 *
 * Product videos are YouTube-only; any other URL yields a null id and is skipped.
 */

// YouTube ids are short alphanumeric tokens; reject anything else so a malformed
// path tail or encoded query material can't leak through.
const YOUTUBE_ID = /^[\w-]{6,}$/;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'm.youtube.com', 'youtu.be']);

// Extract the YouTube video id from a watch/share URL, or null if it isn't a
// (safe http/https) YouTube URL.
export function getYouTubeId(rawUrl: string): string | null {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const host = url.hostname.replace(/^www\./, '');

  if (!YOUTUBE_HOSTS.has(host)) return null;

  // https://www.youtube.com/watch?v=ID
  const vParam = url.searchParams.get('v');

  if (vParam && YOUTUBE_ID.test(vParam)) return vParam;

  // https://www.youtube.com/embed/ID, /shorts/ID, /v/ID
  const match = /\/(?:embed|shorts|v)\/([\w-]+)/.exec(url.pathname);

  if (match?.[1] && YOUTUBE_ID.test(match[1])) return match[1];

  // https://youtu.be/ID — first path segment only, ignoring any tail.
  if (host === 'youtu.be') {
    const [, first] = url.pathname.split('/');

    if (first && YOUTUBE_ID.test(first)) return first;
  }

  return null;
}

// Poster/thumbnail image URL for a YouTube video id (used by the gallery thumbnail).
export function getYouTubePosterUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

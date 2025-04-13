// Function to normalize URL path based on trailing slash configuration
export const normalizeUrlPath = (path: string, trailingSlash: boolean): string => {
  // Remove query string and hash if present
  const pathnameOnly = (path.split('?')[0] ?? '').split('#')[0] ?? '';

  // Remove leading/trailing slashes first
  let normalized = pathnameOnly.replace(/^\/|\/$/g, '');

  // Add leading slash
  normalized = `/${normalized}`;

  // Add trailing slash if configured and path is not the root
  if (trailingSlash && normalized !== '/') {
    normalized += '/';
  } else if (!trailingSlash && normalized.endsWith('/') && normalized !== '/') {
    // Remove trailing slash if not configured and it exists (and not root)
    normalized = normalized.slice(0, -1);
  }

  return normalized;
};

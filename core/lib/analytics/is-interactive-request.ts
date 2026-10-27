import { isbot } from 'isbot';

// Bots, scripts and subresource/fetch requests rarely keep cookies, so counting
// them would send an uncached analytics mutation on every hit.
export function isInteractiveRequest(request: Request): boolean {
  const { headers } = request;
  const userAgent = headers.get('user-agent');

  if (!userAgent || isbot(userAgent)) {
    return false;
  }

  const fetchMode = headers.get('sec-fetch-mode');
  const fetchDest = headers.get('sec-fetch-dest');

  if (fetchMode !== null || fetchDest !== null) {
    return (
      (fetchMode === null || fetchMode === 'navigate') &&
      (fetchDest === null || fetchDest === 'document')
    );
  }

  // Clients without fetch metadata: only count requests that accept a page.
  return headers.get('accept')?.includes('text/html') ?? false;
}

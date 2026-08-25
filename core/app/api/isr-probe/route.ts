/**
 * TEMPORARY — DO NOT MERGE.
 *
 * Catalyst produces no ISR routes, so the revalidation queue has never once
 * executed in production. This route exists solely to create a real ISR entry
 * so that path can be observed end to end.
 *
 * It sits under `app/api` deliberately, for two reasons: `app/[locale]` reads the
 * customer access token, which forces dynamic rendering and would prevent
 * prerendering; and `core/middleware.ts` matches every path except a fixed list
 * that includes `api`, so anywhere else the routing proxy resolves the path
 * against BigCommerce and returns 404 before the handler runs.
 *
 * How to use:
 *   1. Deploy this branch.
 *   2. GET /api/isr-probe and note `generatedAt`.
 *   3. Wait past the revalidate window below.
 *   4. GET twice more. The first request serves the stale copy and enqueues a
 *      revalidation; the second should report a newer `generatedAt`.
 *
 * A `generatedAt` that never advances means the revalidation was enqueued and
 * silently dropped — the failure mode this probe is checking for.
 */
export const revalidate = 60;

export function GET() {
  return Response.json({
    generatedAt: new Date().toISOString(),
    generatedAtMs: Date.now(),
    revalidateWindowSeconds: revalidate,
  });
}

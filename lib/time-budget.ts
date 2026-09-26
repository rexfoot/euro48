// Shared per-request time budget: cron-job.org's free plan cuts the HTTP
// call at 30s, so every source must leave margin and stop starting new
// work well before that — whatever didn't fit just runs next time.
export function makeDeadline(budgetMs: number): () => boolean {
  const start = Date.now();
  return () => Date.now() - start > budgetMs;
}

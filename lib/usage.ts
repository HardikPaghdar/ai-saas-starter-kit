export type UsageSnapshot = {
  workspaceId: string;
  used: number;
  limit: number;
  remaining: number;
};

const counters = new Map<string, number>();

export function getLimit(): number {
  const parsed = Number.parseInt(process.env.WORKSPACE_MONTHLY_LIMIT ?? "50", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
}

export function getUsage(workspaceId: string): UsageSnapshot {
  const used = counters.get(workspaceId) ?? 0;
  const limit = getLimit();
  return { workspaceId, used, limit, remaining: Math.max(0, limit - used) };
}

export function consumeUsage(workspaceId: string): UsageSnapshot | null {
  const current = getUsage(workspaceId);
  if (current.remaining <= 0) return null;
  counters.set(workspaceId, current.used + 1);
  return getUsage(workspaceId);
}

/** Test/demo helper. Do not expose this from an unauthenticated production API. */
export function resetUsageForTests(): void {
  counters.clear();
}

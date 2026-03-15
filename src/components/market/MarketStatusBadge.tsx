interface MarketStatusBadgeProps {
  isResolved: boolean;
  resolvedOutcome: "YES" | "NO" | null;
}

export function MarketStatusBadge({
  isResolved,
  resolvedOutcome,
}: MarketStatusBadgeProps) {
  if (!isResolved) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
        Active
      </span>
    );
  }

  if (resolvedOutcome === "YES") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
        Resolved: YES
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
      Resolved: NO
    </span>
  );
}

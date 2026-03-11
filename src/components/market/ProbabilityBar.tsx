import { formatProbability } from "@/lib/market";

interface ProbabilityBarProps {
  yesProb: number | null;
  noProb: number | null;
}

export function ProbabilityBar({ yesProb, noProb }: ProbabilityBarProps) {
  if (yesProb === null || noProb === null) {
    return (
      <div className="h-6 w-full rounded-full bg-muted animate-pulse" />
    );
  }

  const yesPct = Math.max(yesProb * 100, 1);
  const noPct = Math.max(noProb * 100, 1);

  return (
    <div className="flex w-full items-center gap-2">
      <span className="text-xs font-medium text-green-400 w-12 text-right">
        {formatProbability(yesProb)}
      </span>
      <div className="flex h-4 flex-1 overflow-hidden rounded-full">
        <div
          className="bg-green-500 transition-all duration-300"
          style={{ width: `${(yesPct / (yesPct + noPct)) * 100}%` }}
        />
        <div
          className="bg-red-500 transition-all duration-300"
          style={{ width: `${(noPct / (yesPct + noPct)) * 100}%` }}
        />
      </div>
      <span className="text-xs font-medium text-red-400 w-12">
        {formatProbability(noProb)}
      </span>
    </div>
  );
}

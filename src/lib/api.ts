import type { MarketCondition } from "@/types";

interface MarketRow {
  condition_id: string;
  question: string;
  collateral_address: string;
}

export async function fetchMarkets(): Promise<MarketCondition[]> {
  const res = await fetch("/api/markets");
  if (!res.ok) throw new Error("Failed to fetch markets");
  const rows: MarketRow[] = await res.json();
  return rows.map((r) => ({
    conditionId: r.condition_id as `0x${string}`,
    question: r.question,
    collateralAddress: r.collateral_address as `0x${string}`,
  }));
}

export async function postMarket(
  market: { conditionId: string; question: string; collateralAddress: string; creator: string },
  signMessage: (args: { message: string }) => Promise<string>,
): Promise<void> {
  const message = `Create market: ${market.conditionId}`;
  const signature = await signMessage({ message });
  const res = await fetch("/api/markets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...market, signature, message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error: string }).error);
  }
}

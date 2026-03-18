import type { MarketUniverse } from "@/types";

interface MarketRow {
  condition_id: string;
  question: string;
  collateral_address: string;
}

export async function fetchMarkets(): Promise<MarketUniverse[]> {
  const res = await fetch("/api/markets");
  if (!res.ok) throw new Error("Failed to fetch markets");
  const rows: MarketRow[] = await res.json();
  return rows.map((r) => ({
    universeId: r.condition_id as `0x${string}`,
    question: r.question,
    collateralAddress: r.collateral_address as `0x${string}`,
  }));
}

export async function postMarket(
  market: {
    universeId: string;
    question: string;
    collateralAddress: string;
    creator: string;
  },
  signMessage: (args: { message: string }) => Promise<string>,
): Promise<void> {
  const message = `Create market: ${market.universeId}`;
  const signature = await signMessage({ message });
  const res = await fetch("/api/markets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conditionId: market.universeId,
      question: market.question,
      collateralAddress: market.collateralAddress,
      creator: market.creator,
      signature,
      message,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error: string }).error);
  }
}

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export type InvalidationScope =
  | "market-state"
  | "market-list"
  | "balances"
  | "allowances"
  | "faucet"
  | "pool"
  | "positions";

const SCOPE_MATCHERS: Record<InvalidationScope, (queryKey: unknown) => boolean> = {
  "market-state": (queryKey) => {
    const fn = extractFunctionName(queryKey);
    return fn === "markets" || fn === "resolved" || fn === "calcMarginalPrice";
  },
  "market-list": (queryKey) => {
    return Array.isArray(queryKey) && queryKey[0] === "markets";
  },
  balances: (queryKey) => {
    return extractFunctionName(queryKey) === "balanceOf";
  },
  allowances: (queryKey) => {
    return extractFunctionName(queryKey) === "allowance";
  },
  faucet: (queryKey) => {
    const fn = extractFunctionName(queryKey);
    return fn === "canDrip" || fn === "timeUntilNextDrip" || fn === "dripAmount0" || fn === "dripAmount1" || fn === "getBalances";
  },
  pool: (queryKey) => {
    const fn = extractFunctionName(queryKey);
    return fn === "getSlot0" || fn === "getLiquidity";
  },
  positions: (queryKey) => {
    return Array.isArray(queryKey) && queryKey[0] === "userPositions";
  },
};

function extractFunctionName(queryKey: unknown): string | undefined {
  if (!Array.isArray(queryKey)) return undefined;
  // wagmi v2 query keys: [{ functionName, ... }] or [{ entity, ... }]
  for (const part of queryKey) {
    if (part && typeof part === "object" && "functionName" in part) {
      return (part as { functionName: string }).functionName;
    }
  }
  return undefined;
}

export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(
    (scopes: InvalidationScope[]) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return scopes.some((scope) => SCOPE_MATCHERS[scope](query.queryKey));
        },
      });
    },
    [queryClient],
  );

  return invalidate;
}

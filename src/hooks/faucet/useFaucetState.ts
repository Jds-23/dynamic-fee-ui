import { useMemo } from "react";
import { useAccount, useChainId, useReadContracts } from "wagmi";
import { faucetAbi } from "@/abi/faucet";
import { getAddress } from "@/constants/addresses";

export interface FaucetState {
  canDrip: boolean;
  timeUntilNextDrip: bigint;
  dripAmount0: bigint;
  dripAmount1: bigint;
  faucetBalance0: bigint;
  faucetBalance1: bigint;
  isLoading: boolean;
  refetch: () => void;
}

export function useFaucetState(): FaucetState {
  const { address } = useAccount();
  const chainId = useChainId();

  const faucetAddress = useMemo(() => {
    try {
      return getAddress(chainId, "FAUCET");
    } catch {
      return undefined;
    }
  }, [chainId]);

  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        address: faucetAddress,
        abi: faucetAbi,
        functionName: "canDrip",
        args: address ? [address] : undefined,
        chainId,
      },
      {
        address: faucetAddress,
        abi: faucetAbi,
        functionName: "timeUntilNextDrip",
        args: address ? [address] : undefined,
        chainId,
      },
      {
        address: faucetAddress,
        abi: faucetAbi,
        functionName: "dripAmount0",
        chainId,
      },
      {
        address: faucetAddress,
        abi: faucetAbi,
        functionName: "dripAmount1",
        chainId,
      },
      {
        address: faucetAddress,
        abi: faucetAbi,
        functionName: "getBalances",
        chainId,
      },
    ],
    query: {
      enabled: !!faucetAddress && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds for countdown
    },
  });

  const state = useMemo(() => {
    const canDripResult = data?.[0];
    const timeUntilNextDripResult = data?.[1];
    const dripAmount0Result = data?.[2];
    const dripAmount1Result = data?.[3];
    const balancesResult = data?.[4];

    const canDrip =
      canDripResult?.status === "success" ? (canDripResult.result as boolean) : false;
    const timeUntilNextDrip =
      timeUntilNextDripResult?.status === "success"
        ? (timeUntilNextDripResult.result as bigint)
        : 0n;
    const dripAmount0 =
      dripAmount0Result?.status === "success"
        ? (dripAmount0Result.result as bigint)
        : 0n;
    const dripAmount1 =
      dripAmount1Result?.status === "success"
        ? (dripAmount1Result.result as bigint)
        : 0n;

    let faucetBalance0 = 0n;
    let faucetBalance1 = 0n;
    if (balancesResult?.status === "success" && balancesResult.result) {
      const [b0, b1] = balancesResult.result as [bigint, bigint];
      faucetBalance0 = b0;
      faucetBalance1 = b1;
    }

    return {
      canDrip,
      timeUntilNextDrip,
      dripAmount0,
      dripAmount1,
      faucetBalance0,
      faucetBalance1,
    };
  }, [data]);

  return {
    ...state,
    isLoading,
    refetch,
  };
}

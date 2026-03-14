import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { sepolia, unichainSepolia } from "wagmi/chains";
import {
  clearPrivateKey,
  createSmartAccountClient,
  getOrCreatePrivateKey,
} from "@/lib/smartAccount";

type KernelClient = Awaited<ReturnType<typeof createSmartAccountClient>>;

export interface SmartAccountContextValue {
  address: Address | undefined;
  isConnected: boolean;
  isInitializing: boolean;
  sepoliaClient: KernelClient | undefined;
  unichainClient: KernelClient | undefined;
  getClient: (chainId: number) => KernelClient | undefined;
  privateKey: `0x${string}` | undefined;
  resetAccount: () => void;
}

export const SmartAccountContext = createContext<SmartAccountContextValue>({
  address: undefined,
  isConnected: false,
  isInitializing: true,
  sepoliaClient: undefined,
  unichainClient: undefined,
  getClient: () => undefined,
  privateKey: undefined,
  resetAccount: () => {},
});

export function SmartAccountProvider({ children }: { children: React.ReactNode }) {
  const [sepoliaClient, setSepoliaClient] = useState<KernelClient>();
  const [unichainClient, setUnichainClient] = useState<KernelClient>();
  const [isInitializing, setIsInitializing] = useState(true);
  const [privateKey, setPrivateKey] = useState<`0x${string}`>();

  const init = useCallback(async () => {
    setIsInitializing(true);
    try {
      const key = getOrCreatePrivateKey();
      setPrivateKey(key);

      const [sc, uc] = await Promise.all([
        createSmartAccountClient(key, sepolia),
        createSmartAccountClient(key, unichainSepolia),
      ]);

      setSepoliaClient(sc);
      setUnichainClient(uc);
    } catch (err) {
      console.error("Failed to initialize smart account:", err);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const address = sepoliaClient?.account?.address;
  const isConnected = !!address && !isInitializing;

  const getClient = useCallback(
    (chainId: number) => {
      if (chainId === sepolia.id) return sepoliaClient;
      if (chainId === unichainSepolia.id) return unichainClient;
      return undefined;
    },
    [sepoliaClient, unichainClient],
  );

  const resetAccount = useCallback(() => {
    clearPrivateKey();
    setSepoliaClient(undefined);
    setUnichainClient(undefined);
    setPrivateKey(undefined);
    init();
  }, [init]);

  const value = useMemo<SmartAccountContextValue>(
    () => ({
      address,
      isConnected,
      isInitializing,
      sepoliaClient,
      unichainClient,
      getClient,
      privateKey,
      resetAccount,
    }),
    [address, isConnected, isInitializing, sepoliaClient, unichainClient, getClient, privateKey, resetAccount],
  );

  return (
    <SmartAccountContext.Provider value={value}>
      {children}
    </SmartAccountContext.Provider>
  );
}

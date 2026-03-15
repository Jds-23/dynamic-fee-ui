import {
  create7702KernelAccount,
  create7702KernelAccountClient,
} from "@zerodev/ecdsa-validator";
import { createZeroDevPaymasterClient } from "@zerodev/sdk";
import { type Chain, createPublicClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  ENTRY_POINT,
  getBundlerRpc,
  getPaymasterRpc,
  KERNEL_ADDRESSES,
  KERNEL_VERSION,
} from "./zerodev";

const STORAGE_KEY = "smart-account-private-key";

export function getOrCreatePrivateKey(): `0x${string}` {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored as `0x${string}`;
  const key = generatePrivateKey();
  localStorage.setItem(STORAGE_KEY, key);
  return key;
}

export function clearPrivateKey() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function createSmartAccountClient(
  privateKey: `0x${string}`,
  chain: Chain,
) {
  const publicClient = createPublicClient({ chain, transport: http() });
  const signer = privateKeyToAccount(privateKey);

  const account = await create7702KernelAccount(publicClient, {
    signer,
    entryPoint: ENTRY_POINT,
    kernelVersion: KERNEL_VERSION,
    accountImplementationAddress: KERNEL_ADDRESSES.accountImplementationAddress,
  });

  const paymasterClient = createZeroDevPaymasterClient({
    chain,
    transport: http(getPaymasterRpc(chain.id)),
  });

  const client = create7702KernelAccountClient({
    account,
    chain,
    bundlerTransport: http(getBundlerRpc(chain.id)),
    paymaster: paymasterClient,
    client: publicClient,
  });

  return client;
}

export async function signMessage(
  privateKey: `0x${string}`,
  message: string,
): Promise<string> {
  const account = privateKeyToAccount(privateKey);
  return account.signMessage({ message });
}

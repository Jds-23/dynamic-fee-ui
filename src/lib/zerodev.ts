import {
  getEntryPoint,
  KERNEL_V3_3,
  KernelVersionToAddressesMap,
} from "@zerodev/sdk/constants";

const PROJECT_ID = import.meta.env.VITE_ZERODEV_PROJECT_ID;

export const getBundlerRpc = (chainId: number) =>
  `https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/${chainId}`;

export const getPaymasterRpc = (chainId: number) =>
  `https://rpc.zerodev.app/api/v3/${PROJECT_ID}/chain/${chainId}`;

export const KERNEL_VERSION = KERNEL_V3_3;
export const KERNEL_ADDRESSES = KernelVersionToAddressesMap[KERNEL_V3_3];
export const ENTRY_POINT = getEntryPoint("0.7");

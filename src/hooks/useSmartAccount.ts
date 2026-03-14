import { useContext } from "react";
import { SmartAccountContext } from "@/providers/SmartAccountProvider";

export function useSmartAccount() {
  return useContext(SmartAccountContext);
}

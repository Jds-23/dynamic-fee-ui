import { formatUnits, parseUnits } from "viem";

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  displayDecimals = 6,
): string {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);

  if (num === 0) return "0";
  if (num < 0.000001) return "<0.000001";

  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals,
  });
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  if (!amount || amount === "") return 0n;
  try {
    return parseUnits(amount, decimals);
  } catch {
    return 0n;
  }
}

export function sqrtPriceX96ToPrice(
  sqrtPriceX96: bigint,
  decimals0: number,
  decimals1: number,
): number {
  const Q96 = 2n ** 96n;
  const price = (sqrtPriceX96 * sqrtPriceX96) / Q96;
  const adjustedPrice = Number(price) / Number(Q96);
  const decimalAdjustment = 10 ** (decimals0 - decimals1);
  return adjustedPrice * decimalAdjustment;
}

export function tickToPrice(
  tick: number,
  decimals0: number,
  decimals1: number,
): number {
  const price = 1.0001 ** tick;
  const decimalAdjustment = 10 ** (decimals0 - decimals1);
  return price * decimalAdjustment;
}

export function priceToTick(
  price: number,
  decimals0: number,
  decimals1: number,
): number {
  const decimalAdjustment = 10 ** (decimals0 - decimals1);
  const adjustedPrice = price / decimalAdjustment;
  return Math.floor(Math.log(adjustedPrice) / Math.log(1.0001));
}

export function formatPrice(price: number, precision = 6): string {
  if (price === 0) return "0";
  if (price < 0.000001) return "<0.000001";
  if (price > 1000000) return price.toExponential(2);
  return price.toFixed(precision);
}

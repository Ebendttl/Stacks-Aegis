import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility for combining Tailwind classes with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Convert microunit integer to human-readable sBTC string. Example: 100000 → "0.00100000" */
export const microToSbtc = (micro: number): string =>
  (micro / 100_000_000).toFixed(8);

/** Convert human-readable sBTC decimal to microunit integer. Example: 0.001 → 100000 */
export const sbtcToMicro = (sbtc: number | string): number => {
  const val = typeof sbtc === 'string' ? parseFloat(sbtc) : sbtc;
  return Math.round(val * 100_000_000);
};

export const truncateAddress = (addr: string) => 
  addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : '';

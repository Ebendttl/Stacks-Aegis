/**
 * GROUND TRUTH - sBTC Balance Response (Verified for STDW8SCPAE0MX93M9MD0FSEMHQYB36X1MTZDFJKP)
 * {
 *   "fungible_tokens": {
 *     "ST1F7MZ3GGKSG957BYBTX9TGPHE28B8QDR3PM8CQ.sbtc-token::sbtc-token": {
 *       "balance": "400000000",
 *       "total_sent": "0",
 *       "total_received": "400000000"
 *     }
 *   }
 * }
 */

import { fetchCallReadOnlyFunction, cvToValue, standardPrincipalCV } from "@stacks/transactions";
import { network, CONTRACT_ADDRESSES } from "./stacks-client";

interface VaultStatus {
  breakerActive: boolean;
  threshold: number;
  totalTvl: number;
  currentScore: number;
}

const parseError = (error: any) => {
  console.error("Contract call error:", error);
  return { data: null, error: { message: error?.message || "Function call failed", code: error?.status || 500 } };
};

/**
 * Calls `get-vault-status` on the aegis-vault contract.
 */
export async function fetchVaultStatus() {
  try {
    const [contractAddress, contractName] = CONTRACT_ADDRESSES.aegisVault.split(".");
    
    const resultCV = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-vault-status",
      functionArgs: [],
      senderAddress: contractAddress,
    });

    const parsed = cvToValue(resultCV);
    return {
      data: {
        breakerActive: parsed["breaker-active"],
        threshold: Number(parsed["threshold"]),
        totalTvl: Number(parsed["total-tvl"]),
        currentScore: 0, 
      } as VaultStatus,
      error: null
    };
  } catch (err: any) {
    return parseError(err);
  }
}

/**
 * Calls `get-stability-score` on the risk-oracle contract.
 */
export async function fetchStabilityScore() {
  try {
    const [contractAddress, contractName] = CONTRACT_ADDRESSES.riskOracle.split(".");
    
    const resultCV = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-stability-score",
      functionArgs: [],
      senderAddress: contractAddress,
    });

    const parsed = cvToValue(resultCV);
    return { data: Number(parsed?.value ?? parsed), error: null };
  } catch (err: any) {
    return parseError(err);
  }
}

/**
 * Calls `get-user-balance` on the aegis-vault contract for the specified address.
 */
export async function fetchUserBalance(address: string) {
  if (!address) return { data: 0, error: null };
  try {
    const [contractAddress, contractName] = CONTRACT_ADDRESSES.aegisVault.split(".");
    
    const resultCV = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-user-balance",
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
    });

    const parsed = cvToValue(resultCV);
    return { data: Number(parsed), error: null };
  } catch (err: any) {
    return parseError(err);
  }
}

/**
 * Calls `get-safe-balance` on the safe-vault contract for the specified address.
 */
export async function fetchSafeBalance(address: string) {
  if (!address) return { data: 0, error: null };
  try {
    const [contractAddress, contractName] = CONTRACT_ADDRESSES.safeVault.split(".");
    
    const resultCV = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-safe-balance",
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
    });

    const parsed = cvToValue(resultCV);
    return { data: Number(parsed), error: null };
  } catch (err: any) {
    return parseError(err);
  }
}

export const fetchSbtcBalance = async (address: string): Promise<number> => {
  if (!address || !address.startsWith("ST")) {
    console.error("[Aegis] fetchSbtcBalance: invalid address:", address);
    return 0;
  }

  // Confirmed working token key from live testnet curl
  const SBTC_TOKEN_KEY = "ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token::sbtc-token";

  try {
    const url = `https://api.testnet.hiro.so/extended/v1/address/${address}/balances`;
    console.log("[Aegis] fetchSbtcBalance GET:", url);

    const res = await fetch(url);
    if (!res.ok) {
      console.error("[Aegis] HTTP error:", res.status);
      return 0;
    }

    const data = await res.json();

    // Primary lookup — use confirmed exact key
    let rawBalance = data?.fungible_tokens?.[SBTC_TOKEN_KEY]?.balance;

    // Fallback — search for any key containing "sbtc" in case contract updates
    if (rawBalance === undefined) {
      const allKeys = Object.keys(data?.fungible_tokens ?? {});
      console.log("[Aegis] Primary key not found. All keys:", allKeys);
      const fallbackKey = allKeys.find(k => k.toLowerCase().includes("sbtc"));
      if (fallbackKey) {
        rawBalance = data.fungible_tokens[fallbackKey]?.balance;
        console.log("[Aegis] Using fallback key:", fallbackKey);
      }
    }

    if (rawBalance === undefined) {
      console.warn("[Aegis] No sBTC balance found for address:", address);
      return 0;
    }

    const parsed = parseInt(String(rawBalance), 10);
    console.log("[Aegis] sBTC balance:", parsed, "microunits =", parsed / 100_000_000, "sBTC");
    return isNaN(parsed) ? 0 : parsed;

  } catch (err) {
    console.error("[Aegis] fetchSbtcBalance threw:", err);
    return 0;
  }
};

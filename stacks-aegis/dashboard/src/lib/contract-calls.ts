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
import { network, CONTRACT_ADDRESSES, baseUrl } from "./stacks-client";

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

/**
 * Fetches sBTC balance using the account balances API endpoint.
 * Ensures loading state resolution even on error.
 */
export const fetchSbtcBalance = async (address: string): Promise<number> => {
  if (!address) {
    console.warn("[Aegis] fetchSbtcBalance: address is empty");
    return 0;
  }

  try {
    const url = `${baseUrl}/v2/accounts/${address}/balances`;
    console.log("[Aegis] sBTC Balance Request:", url);

    const res = await fetch(url);

    if (!res.ok) {
      console.error("[Aegis] HTTP error:", res.status, res.statusText);
      return 0;
    }

    const data = await res.json();
    console.log("[Aegis] Full balances response:", JSON.stringify(data, null, 2));

    const fungibleTokens = data?.fungible_tokens ?? {};
    const allKeys = Object.keys(fungibleTokens);
    console.log("[Aegis] All fungible token keys:", allKeys);

    // Find the sBTC key — it contains "sbtc-token" somewhere in the key string
    const sbtcKey = allKeys.find(k =>
      k.toLowerCase().includes("sbtc-token") ||
      k.toLowerCase().includes("sbtc")
    );

    if (!sbtcKey) {
      console.warn("[Aegis] No sBTC key found in fungible_tokens. Keys present:", allKeys);
      return 0;
    }

    console.log("[Aegis] Found sBTC key:", sbtcKey);
    const rawBalance = fungibleTokens[sbtcKey]?.balance;
    console.log("[Aegis] Raw balance value:", rawBalance, "type:", typeof rawBalance);

    // Balance is always returned as a string by the Stacks API — parse it safely
    const parsed = parseInt(String(rawBalance), 10);

    if (isNaN(parsed)) {
      console.error("[Aegis] Balance parsed as NaN from raw value:", rawBalance);
      return 0;
    }

    console.log("[Aegis] Final parsed balance in microunits:", parsed);
    return parsed;

  } catch (err) {
    console.error("[Aegis] fetchSbtcBalance threw:", err);
    return 0;
  }
};

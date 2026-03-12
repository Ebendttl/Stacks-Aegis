import { callReadOnlyFunction, cvToJSON, fetchCallReadOnlyFunction, cvToValue, standardPrincipalCV } from "@stacks/transactions";
import { network, CONTRACT_ADDRESSES } from "./stacks-client";

interface VaultStatus {
  breakerActive: boolean;
  threshold: number;
  totalTvl: number;
  currentScore: number;
}

const parseError = (error: any) => {
  console.error("Contract call error:", error);
  return { error: error?.message || "Function call failed", code: error?.status || 500 };
};

/**
 * Calls `get-vault-status` on the aegis-vault contract.
 * @returns {Promise<{ data?: VaultStatus, error?: { message: string, code: number } }>} The parsed vault status.
 * Failure mode: Returns error object if the node is offline or the contract does not exist.
 */
export async function fetchVaultStatus() {
  try {
    const [contractAddress, contractName] = CONTRACT_ADDRESSES.aegisVault.split(".");
    
    // fetchCallReadOnlyFunction is easier for purely unauthenticated frontend reads than callReadOnlyFunction (which requires sender address)
    const resultCV = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-vault-status",
      functionArgs: [],
      senderAddress: contractAddress, // Safe placeholder for read-only
    });

    const parsed = cvToValue(resultCV);
    // clarity tuple result
    return {
      data: {
        breakerActive: parsed["breaker-active"],
        threshold: Number(parsed["threshold"]),
        totalTvl: Number(parsed["total-tvl"]),
        currentScore: 0, // Mocked for now, populated by other calls below
      } as VaultStatus,
    };
  } catch (err: any) {
    return parseError(err);
  }
}

/**
 * Calls `get-stability-score` on the risk-oracle contract.
 * @returns {Promise<{ data?: number, error?: { message: string, code: number } }>} The 0-100 stability score.
 * Failure mode: Returns error object if API is down.
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
    // expected result: (ok u100) -> returns { value: 100 } in JSON
    return { data: Number(parsed?.value ?? parsed) };
  } catch (err: any) {
    return parseError(err);
  }
}

/**
 * Calls `get-raw-feeds` on the risk-oracle contract.
 * @returns {Promise<{ data?: { pyth: number, redstone: number, onchain: number }, error?: { message: string, code: number } }>} The raw feed components.
 * Failure mode: Returns error object if API is down.
 */
export async function fetchRawFeeds() {
  try {
    const [contractAddress, contractName] = CONTRACT_ADDRESSES.riskOracle.split(".");
    
    const resultCV = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-raw-feeds",
      functionArgs: [],
      senderAddress: contractAddress,
    });

    const parsed = cvToValue(resultCV);
    // expected result: (ok { pyth: u1000000, redstone: ... })
    const tuple = parsed?.value || parsed;
    return { 
      data: {
        pyth: Number(tuple.pyth),
        redstone: Number(tuple.redstone),
        onchain: Number(tuple.onchain),
      }
    };
  } catch (err: any) {
    return parseError(err);
  }
}

/**
 * Calls `get-user-balance` on the aegis-vault contract for the specified address.
 * @param address The user's Stacks native address.
 * @returns {Promise<{ data?: number, error?: { message: string, code: number } }>} The specific user's balance.
 * Failure mode: Returns error object if API is down.
 */
export async function fetchUserBalance(address: string) {
  if (!address) return { data: 0 };
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
    return { data: Number(parsed) };
  } catch (err: any) {
    return parseError(err);
  }
}

/**
 * Calls `get-safe-balance` on the safe-vault contract for the specified address.
 * @param address The user's Stacks native address.
 * @returns {Promise<{ data?: number, error?: { message: string, code: number } }>} The specific user's balance located in the safe vault.
 * Failure mode: Returns error object if API is down.
 */
export async function fetchSafeBalance(address: string) {
  if (!address) return { data: 0 };
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
    return { data: Number(parsed) };
  } catch (err: any) {
    return parseError(err);
  }
}

/**
 * Calls `get-protocol-score` on the risk-oracle contract.
 * @param contractPrincipal The Stacks principal representing the protocol context.
 * @returns {Promise<{ data?: number, error?: { message: string, code: number } }>} The 0-100 individual security score of that protocol.
 * Failure mode: Returns error object if API is down.
 */
export async function fetchProtocolScore(contractPrincipal: string) {
  if (!contractPrincipal) return { data: 50 }; // default
  try {
    const [contractAddress, contractName] = CONTRACT_ADDRESSES.riskOracle.split(".");
    
    const resultCV = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-protocol-score",
      functionArgs: [standardPrincipalCV(contractPrincipal)],
      senderAddress: contractAddress,
    });

    const parsed = cvToValue(resultCV);
    return { data: Number(parsed) };
  } catch (err: any) {
    return parseError(err);
  }
}

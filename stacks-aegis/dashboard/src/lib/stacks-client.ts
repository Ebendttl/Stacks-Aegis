import { STACKS_TESTNET, createNetwork } from "@stacks/network";
import { createClient } from "@stacks/blockchain-api-client";
import { AppConfig, UserSession } from '@stacks/connect';

export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Instantiate the testnet network
export const network = createNetwork({
  ...STACKS_TESTNET,
  client: { baseUrl: import.meta.env.VITE_STACKS_API_URL || "https://api.testnet.hiro.so" }
});

// Replace ST... with your actual testnet deployer address after running deploy-testnet.sh.
// These are loaded from environment variables in Vite (.env.testnet)
export const CONTRACT_ADDRESSES = {
  aegisTraits: import.meta.env.VITE_DEPLOYER_ADDRESS ? `${import.meta.env.VITE_DEPLOYER_ADDRESS}.aegis-traits` : "ST_YOUR_DEPLOYER_ADDRESS.aegis-traits",
  riskOracle: import.meta.env.VITE_RISK_ORACLE_CONTRACT || "ST_YOUR_DEPLOYER_ADDRESS.risk-oracle",
  aegisVault: import.meta.env.VITE_AEGIS_VAULT_CONTRACT || "ST_YOUR_DEPLOYER_ADDRESS.aegis-vault",
  safeVault: import.meta.env.VITE_SAFE_VAULT_CONTRACT || "ST_YOUR_DEPLOYER_ADDRESS.safe-vault",
};

export const SBTC_CONTRACT_ADDRESS = import.meta.env.VITE_SBTC_CONTRACT || "ST_YOUR_DEPLOYER_ADDRESS.mock-sbtc";

// Export a configured stacksApiClient using @stacks/blockchain-api-client createClient.
export const stacksApiClient = createClient({
  baseUrl: import.meta.env.VITE_STACKS_API_URL || "https://api.testnet.hiro.so",
});

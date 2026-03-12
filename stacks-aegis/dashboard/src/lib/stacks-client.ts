import { STACKS_TESTNET } from "@stacks/network";
import { createClient } from "@stacks/blockchain-api-client";
import { AppConfig, UserSession } from '@stacks/connect';

// singleton instances
export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Instantiate the testnet network
export const network = {
  ...STACKS_TESTNET,
  coreApiUrl: "https://api.testnet.hiro.so"
};
export const baseUrl = "https://api.testnet.hiro.so";

// Replace ST... with your actual testnet deployer address after running deploy-testnet.sh.
// These are loaded from environment variables in Vite (.env.testnet)
export const CONTRACT_ADDRESSES = {
  aegisTraits: import.meta.env.VITE_DEPLOYER_ADDRESS ? `${import.meta.env.VITE_DEPLOYER_ADDRESS}.aegis-traits` : "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.aegis-traits",
  riskOracle: import.meta.env.VITE_RISK_ORACLE_CONTRACT || "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.risk-oracle",
  aegisVault: import.meta.env.VITE_AEGIS_VAULT_CONTRACT || "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.aegis-vault",
  safeVault: import.meta.env.VITE_SAFE_VAULT_CONTRACT || "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.safe-vault",
};

export const SBTC_CONTRACT_ADDRESS = import.meta.env.VITE_SBTC_CONTRACT || "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.mock-sbtc";

// Export a configured stacksApiClient using @stacks/blockchain-api-client createClient.
export const stacksApiClient = createClient({
  baseUrl,
});

import { useEffect, useState } from 'react';
import { baseUrl, CONTRACT_ADDRESSES, userSession, network } from '../lib/stacks-client';
import { fetchSbtcBalance } from '../lib/contract-calls';
import { uintCV, fetchCallReadOnlyFunction, cvToJSON, standardPrincipalCV } from '@stacks/transactions';

export interface VaultData {
  stabilityScore: number;
  breakerActive: boolean;
  totalTvl: number;
  userVaultBalance: number;
  userSafeBalance: number;
  userSbtcBalance: number;
  threshold: number;
  lastUpdatedBlock: number;
  isLoading: boolean;
  isBalanceLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVaultData(): VaultData {
  const [data, setData] = useState<Omit<VaultData, 'refetch'>>({
    stabilityScore: 98,
    breakerActive: false,
    totalTvl: 0,
    userVaultBalance: 0,
    userSafeBalance: 0,
    userSbtcBalance: 0,
    threshold: 95,
    lastUpdatedBlock: 0,
    isLoading: true,
    isBalanceLoading: false,
    error: null,
  });

  const [address, setAddress] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [userSbtcWalletBalance, setUserSbtcWalletBalance] = useState(0);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setAddress(userSession.loadUserData().profile.stxAddress.testnet);
    }
  }, []);

  const fetchVaultState = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [addr, name] = CONTRACT_ADDRESSES.riskOracle.split('.');
      const [vAddr, vName] = CONTRACT_ADDRESSES.aegisVault.split('.');
      const [sAddr, sName] = CONTRACT_ADDRESSES.safeVault.split('.');

      let userAddress = address || "";
      if (!userAddress && userSession.isUserSignedIn()) {
        userAddress = userSession.loadUserData().profile.stxAddress.testnet;
      }

      // 1. Fetch Oracle Stability
      const oracleRes = await fetchCallReadOnlyFunction({
        network,
        contractAddress: addr,
        contractName: name,
        functionName: 'get-stability-score',
        functionArgs: [],
        senderAddress: addr, 
      });
      const oracleData = cvToJSON(oracleRes);
      const stability = Number(oracleData.value.value);

      // 2. Fetch Global Breaker & Vault Status
      const vaultStatusRes = await fetchCallReadOnlyFunction({
        network,
        contractAddress: vAddr,
        contractName: vName,
        functionName: 'get-vault-status',
        functionArgs: [],
        senderAddress: addr,
      });
      const vaultStatus = cvToJSON(vaultStatusRes).value;
      const isBroken = Boolean(vaultStatus['breaker-active'].value);
      const globalThreshold = Number(vaultStatus['threshold'].value);
      const totalTvl = Number(vaultStatus['total-tvl'].value);

      // 3. Fetch Balances if connected
      let userBal = 0;
      let safeBal = 0;
      let sbtcBal = 0;
      let userThreshold = globalThreshold;

      if (userAddress) {
          try {
            console.log("[Aegis] useVaultData: fetching user balance for:", userAddress);
            const balRes = await fetchCallReadOnlyFunction({
              network,
              contractAddress: vAddr,
              contractName: vName,
              functionName: 'get-user-balance',
              functionArgs: [standardPrincipalCV(userAddress)],
              senderAddress: userAddress,
            });
            userBal = Number(cvToJSON(balRes).value.value);

            const threshRes = await fetchCallReadOnlyFunction({
              network,
              contractAddress: vAddr,
              contractName: vName,
              functionName: 'get-user-threshold',
              functionArgs: [standardPrincipalCV(userAddress)],
              senderAddress: userAddress,
            });
            userThreshold = Number(cvToJSON(threshRes).value.value);
          } catch (e: any) {
            console.error("[Aegis] State fetch failed for userAddress:", userAddress);
            console.error("[Aegis] Error details:", e.message || e);
            // ROOT CAUSE 1 FIX: Defensive logging for BigInt issues
            if (e.message?.includes("BigInt")) {
              console.error("[Aegis] BigInt conversion failed. Check if userAddress was accidentally passed where a number was expected.");
            }
          }

          try {
            const safeRes = await fetchCallReadOnlyFunction({
              network,
              contractAddress: sAddr,
              contractName: sName,
              functionName: 'get-safe-balance',
              functionArgs: [standardPrincipalCV(userAddress)],
              senderAddress: userAddress,
            });
            safeBal = Number(cvToJSON(safeRes).value.value);
            // sBTC balance fetch moved to its own effect (Fix 1)
          } catch (e) {
            console.error("Partial fetch error", e);
          }
      }

      const info = await fetch(baseUrl + "/v2/info").then(r => r.json()).catch(() => null);

      setData({
        stabilityScore: isNaN(stability) ? 98 : stability,
        breakerActive: isBroken,
        totalTvl: totalTvl || 0, 
        userVaultBalance: userBal,
        userSafeBalance: safeBal,
        userSbtcBalance: userSbtcWalletBalance, // Use the state from the separate effect
        threshold: userThreshold,
        lastUpdatedBlock: info?.stacks_tip_height || 0,
        isLoading: false,
        isBalanceLoading,
        error: null,
      });

    } catch (e: any) {
      console.error("Vault fetch failed", e);
      setData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: e.message || "Network Error" 
      }));
    }
  };

  useEffect(() => {
    fetchVaultState();
    const timer = setInterval(fetchVaultState, 30000);
    return () => clearInterval(timer);
  }, [address]);

  // FIX 1 — Guarantee isBalanceLoading always resolves
  useEffect(() => {
    if (!address) return;

    console.log("[Aegis] Starting sBTC balance fetch for:", address);
    setIsBalanceLoading(true);

    fetchSbtcBalance(address)
      .then((balance) => {
        console.log("[Aegis] Balance fetch resolved:", balance);
        setUserSbtcWalletBalance(balance);
      })
      .catch((err) => {
        console.error("[Aegis] Balance fetch rejected:", err);
        setUserSbtcWalletBalance(0);
      })
      .finally(() => {
        console.log("[Aegis] Balance fetch complete — setting isBalanceLoading to false");
        setIsBalanceLoading(false);
      });
  }, [address]);

  return { ...data, refetch: fetchVaultState };
}

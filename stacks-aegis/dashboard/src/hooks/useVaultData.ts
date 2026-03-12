import { useEffect, useState } from 'react';
import { baseUrl, CONTRACT_ADDRESSES, userSession, network } from '../lib/stacks-client';
import { uintCV, fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';

export interface VaultData {
  stabilityScore: number;
  breakerActive: boolean;
  totalTvl: number;
  userVaultBalance: number;
  userSafeBalance: number;
  threshold: number;
  lastUpdatedBlock: number;
  isLoading: boolean;
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
    threshold: 95,
    lastUpdatedBlock: 0,
    isLoading: true,
    error: null,
  });

  const fetchVaultState = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const [addr, name] = CONTRACT_ADDRESSES.riskOracle.split('.');
      const [vAddr, vName] = CONTRACT_ADDRESSES.aegisVault.split('.');
      const [sAddr, sName] = CONTRACT_ADDRESSES.safeVault.split('.');

      let userAddress = "";
      try {
        if (userSession.isUserSignedIn()) {
          userAddress = userSession.loadUserData().profile.stxAddress.testnet;
        }
      } catch (e) {
        console.warn("User session error", e);
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
      const stability = Number(cvToJSON(oracleRes).value);

      // 2. Fetch Global Breaker
      const breakerRes = await fetchCallReadOnlyFunction({
        network,
        contractAddress: addr,
        contractName: name,
        functionName: 'is-circuit-broken',
        functionArgs: [],
        senderAddress: addr,
      });
      const isBroken = Boolean(cvToJSON(breakerRes).value);

      // 3. Fetch Balances if connected
      let userBal = 0;
      let safeBal = 0;
      let userThreshold = 95;

      if (userAddress) {
         try {
           const balRes = await fetchCallReadOnlyFunction({
             network,
             contractAddress: vAddr,
             contractName: vName,
             functionName: 'get-user-balance',
             functionArgs: [uintCV(userAddress)],
             senderAddress: userAddress,
           });
           userBal = Number(cvToJSON(balRes).value);

           const threshRes = await fetchCallReadOnlyFunction({
             network,
             contractAddress: vAddr,
             contractName: vName,
             functionName: 'get-user-threshold',
             functionArgs: [uintCV(userAddress)],
             senderAddress: userAddress,
           });
           userThreshold = Number(cvToJSON(threshRes).value);

           const safeRes = await fetchCallReadOnlyFunction({
             network,
             contractAddress: sAddr,
             contractName: sName,
             functionName: 'get-safe-balance',
             functionArgs: [uintCV(userAddress)],
             senderAddress: userAddress,
           });
           safeBal = Number(cvToJSON(safeRes).value);
         } catch (e) {
           console.error("Partial fetch error", e);
         }
      }

      // Get block info via fetch to avoid OpenAPI path issues
      const info = await fetch(baseUrl + "/extended/v1/info").then(r => r.json()).catch(() => null);

      setData({
        stabilityScore: stability,
        breakerActive: isBroken,
        totalTvl: 1250000, 
        userVaultBalance: userBal,
        userSafeBalance: safeBal,
        threshold: userThreshold,
        lastUpdatedBlock: info?.stacks_tip_height || 0,
        isLoading: false,
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
  }, []);

  return { ...data, refetch: fetchVaultState };
}

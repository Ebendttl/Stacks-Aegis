import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchVaultStatus, 
  fetchStabilityScore, 
  fetchRawFeeds, 
  fetchProtocolScore, 
  fetchUserBalance, 
  fetchSafeBalance 
} from '../lib/contract-calls';
import { CONTRACT_ADDRESSES, stacksApiClient } from '../lib/stacks-client';
import { useWalletStore } from '../modules/dashboard/WalletConnect';

export interface VaultData {
  stabilityScore: number;
  breakerActive: boolean;
  threshold: number;
  totalTvl: number;
  userVaultBalance: number;
  userSafeBalance: number;
  rawFeeds: { pyth: number; redstone: number; onchain: number };
  protocolScores: Record<string, number>;
  lastUpdatedBlock: number;
  isLoading: boolean;
  error: string | null;
}

const MOCK_PROTOCOLS = [
  "Bitflow",
  "Zest Protocol",
  "Hermetica",
  "Velar"
];

const parseDeployer = () => CONTRACT_ADDRESSES.riskOracle.split(".")[0] || "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export function useVaultData() {
  const { address } = useWalletStore();
  
  const [data, setData] = useState<VaultData>({
    stabilityScore: 100,
    breakerActive: false,
    threshold: 95,
    totalTvl: 0,
    userVaultBalance: 0,
    userSafeBalance: 0,
    rawFeeds: { pyth: 0, redstone: 0, onchain: 0 },
    protocolScores: {},
    lastUpdatedBlock: 0,
    isLoading: true,
    error: null,
  });

  const prevBreakerRef = useRef<boolean>(false);

  // Ask for notification permission immediately upon hook use if connected, or gracefully request
  useEffect(() => {
    if (address && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [address]);

  const fetchCoreData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setData(prev => ({ ...prev, isLoading: true, error: null }));

      const [
        vaultRes,
        scoreRes,
        feedsRes,
        infoRes
      ] = await Promise.all([
        fetchVaultStatus(),
        fetchStabilityScore(),
        fetchRawFeeds(),
        stacksApiClient.infoApi.getCoreApiInfo()
      ]);

      if (vaultRes.error) throw new Error(vaultRes.error.message);
      if (scoreRes.error) throw new Error(scoreRes.error.message);
      if (feedsRes.error) throw new Error(feedsRes.error.message);

      // fetch protocol scores
      const deployer = parseDeployer();
      const pScores: Record<string, number> = {};
      await Promise.all(
        MOCK_PROTOCOLS.map(async (name, i) => {
          // just mock a principal derived from deployer
          const principal = `${deployer}.mock-protocol-${i}`;
          const res = await fetchProtocolScore(principal);
          pScores[name] = res.data ?? 95;
        })
      );

      const isBreakerTripped = vaultRes.data!.breakerActive;

      // Notification logic
      if (!prevBreakerRef.current && isBreakerTripped) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("⚠ STACKS AEGIS", {
            body: "Circuit Breaker Tripped. Your funds are being moved to the Safe Vault.",
            icon: "/aegis-logo.png"
          });
        }
      }
      prevBreakerRef.current = isBreakerTripped;

      setData(prev => ({
        ...prev,
        stabilityScore: scoreRes.data || 0,
        breakerActive: isBreakerTripped,
        threshold: vaultRes.data!.threshold,
        totalTvl: vaultRes.data!.totalTvl,
        rawFeeds: feedsRes.data!,
        protocolScores: pScores,
        lastUpdatedBlock: infoRes.stacks_tip_height,
        isLoading: false,
        error: null
      }));

    } catch (err: any) {
      console.error("Polling error", err);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "Network offline"
      }));
    }
  }, []);

  const fetchBalances = useCallback(async (userAddress: string) => {
    try {
      const [vaultBal, safeBal] = await Promise.all([
        fetchUserBalance(userAddress),
        fetchSafeBalance(userAddress)
      ]);
      
      setData(prev => ({
        ...prev,
        userVaultBalance: vaultBal.data || 0,
        userSafeBalance: safeBal.data || 0
      }));
    } catch (err: any) {
      console.error("Balance fetch error", err);
    }
  }, []);

  // Effect 1: Address change -> fetch balances immediately
  useEffect(() => {
    if (address) {
      fetchBalances(address);
    } else {
      setData(prev => ({ ...prev, userVaultBalance: 0, userSafeBalance: 0 }));
    }
  }, [address, fetchBalances]);

  // Effect 2: Polling loop every 10 seconds
  useEffect(() => {
    fetchCoreData(true); // initial fetch
    const intervalId = setInterval(() => {
      fetchCoreData();
      if (useWalletStore.getState().address) {
        fetchBalances(useWalletStore.getState().address!);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchCoreData, fetchBalances]);

  // Expose immediate refetch
  const refetch = useCallback(() => {
    fetchCoreData();
    if (address) {
      fetchBalances(address);
    }
  }, [fetchCoreData, fetchBalances, address]);

  return { ...data, refetch };
}

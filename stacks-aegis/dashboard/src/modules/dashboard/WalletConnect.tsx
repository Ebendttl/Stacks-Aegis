import { useEffect } from 'react';
import { showConnect } from '@stacks/connect';
import { create } from 'zustand';
import { Button } from '@/components/ui/button';
import { userSession } from '../../lib/stacks-client'; // We'll export userSession from stacks-client

interface WalletStore {
  address: string | null;
  isConnected: boolean;
  network: "testnet" | "mainnet";
  connect: () => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  isConnected: false,
  network: "testnet",
  connect: () => {
    showConnect({
      appDetails: {
        name: "Stacks Aegis",
        icon: window.location.origin + "/aegis-logo.png",
      },
      onFinish: ({ userSession: activeSession }) => {
        const userData = activeSession.loadUserData();
        set({
          isConnected: true,
          address: userData.profile.stxAddress.testnet,
        });
      },
    });
  },
  disconnect: () => {
    // We'll manage session state in the component using useConnect but zustand is required.
    // However, if we're using @stacks/connect Connect provider, we can use useConnect().disconnect();
    set({ isConnected: false, address: null });
  }
}));

export function WalletConnect() {
  const { address, isConnected, connect, disconnect } = useWalletStore();

  // Sync initial state if already connected
  useEffect(() => {
    if (userSession?.isUserSignedIn()) {
      try {
        const userData = userSession.loadUserData();
        if (userData?.profile?.stxAddress) {
          useWalletStore.setState({
            isConnected: true,
            address: userData.profile.stxAddress.testnet || Object.values(userData.profile.stxAddress)[0],
          });
        }
      } catch (e) {
        console.error("Failed to load user data", e);
      }
    }
  }, []);

  const handleConnect = () => {
    if (typeof window !== 'undefined') {
      connect();
    }
  };

  const handleDisconnect = () => {
    if (userSession?.isUserSignedIn()) {
      userSession.signUserOut();
    }
    disconnect();
  };

  if (!isConnected) {
    return (
      <Button variant="outline" size="sm" onClick={handleConnect} className="rounded-none border-2 border-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] text-black">
        CONNECT WALLET
      </Button>
    );
  }

  const truncatedAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '';

  return (
    <div className="flex items-center gap-2 group relative">
      <div className="flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-white font-mono text-sm font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        {truncatedAddress}
      </div>
      <Button 
        variant="destructive" 
        size="sm" 
        className="absolute right-0 top-[110%] opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-none border-2 border-black font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)]"
        onClick={handleDisconnect}
      >
        DISCONNECT
      </Button>
    </div>
  );
}

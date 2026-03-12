import { create } from 'zustand';
import { Button } from '@/components/ui/button';
import { userSession } from '../../lib/stacks-client';
import { showConnect, authenticate } from '@stacks/connect';

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
    const authOptions = {
      appDetails: {
        name: "Stacks Aegis",
        icon: window.location.origin + "/aegis-logo.png",
      },
      userSession,
      onFinish: () => {
        const userData = userSession.loadUserData();
        const testnetAddress = userData?.profile?.stxAddress?.testnet;

        console.log("[Aegis] Wallet connected and session saved:", testnetAddress);

        if (!testnetAddress || !testnetAddress.startsWith("ST")) {
          console.error("[Aegis] Bad address from wallet:", testnetAddress);
          return;
        }

        useWalletStore.setState({
          address: testnetAddress,
          isConnected: true,
          network: "testnet"
        });
      },
      onCancel: () => {
        console.log("[Aegis] Wallet connection cancelled by user");
      },
    };

    if (typeof showConnect === 'function') {
      showConnect(authOptions);
    } else if (typeof authenticate === 'function') {
      authenticate(authOptions);
    }
  },
  disconnect: () => {
    userSession.signUserOut();
    set({ isConnected: false, address: null });
    console.log("[Aegis] Wallet disconnected and session cleared");
  }
}));

export function WalletConnect() {
  const { address, isConnected, connect, disconnect } = useWalletStore();


  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
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

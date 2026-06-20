import { create } from 'zustand';
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
      <button onClick={handleConnect} style={{
        background: 'transparent',
        border: '2px solid #f5a623',
        color: '#f5a623',
        fontFamily: 'monospace',
        fontSize: '11px',
        letterSpacing: '2px',
        padding: '8px 16px',
        cursor: 'pointer',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap'
      }}>
        CONNECT WALLET
      </button>
    );
  }

  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <div className="flex items-center gap-2 group relative">
      <div 
        onClick={handleDisconnect}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '2px solid #333',
          padding: '6px 12px',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
        {truncatedAddress}
      </div>
    </div>
  );
}

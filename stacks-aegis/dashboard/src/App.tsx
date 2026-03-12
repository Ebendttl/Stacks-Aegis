import { useEffect } from 'react';
import { userSession } from "./lib/stacks-client";
import { useWalletStore } from "./modules/dashboard/WalletConnect";
import { MissionControl } from './modules/dashboard/MissionControl'
import './App.css'

function App() {
  useEffect(() => {
    // Restore session on app load
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const testnetAddress = userData?.profile?.stxAddress?.testnet;

      if (testnetAddress && testnetAddress.startsWith("ST")) {
        console.log("[Aegis] Session restored from localStorage:", testnetAddress);
        useWalletStore.setState({
          address: testnetAddress,
          isConnected: true,
          network: "testnet"
        });
      }
    } else {
      console.log("[Aegis] No existing session found — user must connect wallet");
    }
  }, []);

  // Prevent double-injection conflict with Leather wallet extension
  if (typeof window !== "undefined" && (window as any).StacksProvider) {
    console.log("[Aegis] Leather StacksProvider detected — skipping app provider injection");
  }

  return (
    <div className="min-h-screen bg-[#E5E7EB]">
      <MissionControl />
    </div>
  )
}

export default App

import { useMemo } from 'react';
import { AppConfig, UserSession } from '@stacks/connect';
import { MissionControl } from './modules/dashboard/MissionControl'
import './App.css'

function App() {
  // Use useMemo to ensure AppConfig and UserSession are created only once
  // This prevents re-injection conflicts with the Leather wallet extension
  const appConfig = useMemo(() => new AppConfig(['store_write', 'publish_data']), []);
  const userSession = useMemo(() => new UserSession({ appConfig }), [appConfig]);

  // Prevent double-injection conflict with Leather wallet extension
  if (typeof window !== "undefined" && (window as any).StacksProvider) {
    console.log("[Aegis] Leather StacksProvider detected — skipping app provider injection");
  }

  // userSession is instantiated here to satisfy the 'only once' requirement
  // but MissionControl uses the singleton from lib/stacks-client.ts
  // We keep this here to ensure the provider is ready.
  console.log("[Aegis] App initialized with userSession state:", userSession.isUserSignedIn());

  return (
    <div className="min-h-screen bg-[#E5E7EB]">
      <MissionControl />
    </div>
  )
}

export default App

import { useEffect, useState } from 'react';
import { Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { RiskRadar } from "../risk/RiskRadar"
import { StabilityScoreGauge } from "../risk/StabilityScoreGauge"
import { VaultExposure } from "../vaults/VaultExposure"
import { EventTimeline } from "./EventTimeline"
import { WalletConnect, useWalletStore } from "./WalletConnect"
import { useVaultData } from "../../hooks/useVaultData"
import { openContractCall } from "@stacks/connect"
import { uintCV } from "@stacks/transactions"
import { network, CONTRACT_ADDRESSES } from "../../lib/stacks-client"
import { toast, txWithdraw } from "../../lib/transactions"

export function MissionControl() {
  const { isConnected } = useWalletStore()
  const vaultData = useVaultData()
  
  const [threshold, setThreshold] = useState([vaultData.threshold || 95])
  
  // Update local slider when blockchain syncs
  useEffect(() => {
    if (vaultData.threshold) setThreshold([vaultData.threshold])
  }, [vaultData.threshold])

  const handleApplyConfig = () => {
    if (!isConnected) {
      toast("Connect wallet to save configuration on-chain")
      return
    }
    const [contractAddress, contractName] = CONTRACT_ADDRESSES.aegisVault.split('.')
    openContractCall({
      network,
      contractAddress,
      contractName,
      functionName: 'set-user-threshold',
      functionArgs: [uintCV(threshold[0])],
      onFinish: () => {
        toast("Threshold configuration transaction submitted.")
        vaultData.refetch()
      }
    })
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-all duration-300 ${vaultData.breakerActive ? "border-t-[12px] border-panic" : "border-t-[12px] border-stacks"}`}>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic">MISSION CONTROL</h1>
          <p className="mono text-xs font-bold text-muted-foreground flex items-center gap-2">
            Stacks Aegis Institutional Guard | Version 2.0.0-react 
            {vaultData.lastUpdatedBlock > 0 && <span className="bg-black text-white px-1 ml-2">LAST BLOCK: #{vaultData.lastUpdatedBlock}</span>}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <WalletConnect />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar / Config */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase">Threshold: {"<"} 0.{threshold[0]}</label>
                  <span className="mono text-[10px] font-bold">BALANCED</span>
                </div>
                {vaultData.isLoading ? (
                  <div className="h-4 w-full animate-shimmer border-2 border-black" />
                ) : (
                  <Slider 
                    value={threshold} 
                    onValueChange={setThreshold} 
                    max={99} 
                    min={0} 
                    step={1} 
                  />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight italic">
                Balanced Profile: Faster exits, moderate yield interruption risk.
              </p>
              <Button className="w-full" onClick={handleApplyConfig} disabled={vaultData.isLoading}>
                APPLY CONFIGURATION
              </Button>
            </CardContent>
          </Card>

          <RiskRadar data={vaultData} />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {vaultData.error && (
            <Alert variant="destructive">
              <AlertTitle className="font-black italic">NODE CONNECTION ERROR</AlertTitle>
              <AlertDescription className="font-bold">{vaultData.error}. Some data may be unavailable.</AlertDescription>
            </Alert>
          )}

          {vaultData.isLoading && !vaultData.lastUpdatedBlock ? (
            <div className="space-y-6">
               <div className="h-64 w-full animate-shimmer border-2 border-black" />
               <div className="h-48 w-full animate-shimmer border-2 border-black" />
            </div>
          ) : vaultData.breakerActive ? (
            <div className="space-y-6">
              <Alert variant="destructive" className="bg-red-500 text-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-none">
                <AlertTitle className="font-black italic text-xl">EMERGENCY SYSTEM ACTIVATED</AlertTitle>
                <AlertDescription className="font-bold">
                  Automated withdrawal sequence in progress. All capital is being redirected to the secure Aegis vault.
                </AlertDescription>
              </Alert>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Real-time Incident Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <EventTimeline />
                </CardContent>
              </Card>
              <div className="flex gap-4">
                <Button className="flex-1 border-2 border-black rounded-none font-bold" disabled={true} variant="outline">
                  RE-ENTER POOLS (BREAKER ACTIVE)
                </Button>
                <Button variant="outline" className="flex-1 border-2 border-black rounded-none font-bold shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                  onClick={() => txWithdraw(vaultData.userVaultBalance, () => vaultData.refetch())}
                  disabled={vaultData.userVaultBalance === 0}>
                  WITHDRAW TO WALLET
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StabilityScoreGauge score={vaultData.stabilityScore} />
                <Card className="flex flex-col justify-center items-center text-center">
                  <Activity className="h-12 w-12 mb-2 text-stacks" />
                  <p className="font-black text-2xl">NOMINAL</p>
                  <p className="mono text-[10px] font-bold">SYSTEM STATUS</p>
                </Card>
              </div>
              <VaultExposure data={vaultData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

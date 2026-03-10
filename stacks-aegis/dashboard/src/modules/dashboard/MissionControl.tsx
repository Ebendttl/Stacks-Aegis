import React, { useState } from "react"
import { Shield, Activity, Zap, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RiskRadar } from "../risk/RiskRadar"
import { StabilityScoreGauge } from "../risk/StabilityScoreGauge"
import { VaultExposure } from "../vaults/VaultExposure"
import { EventTimeline } from "./EventTimeline"

type Phase = "PROTECT" | "MONITOR" | "REACT" | "RECOVER"

export function MissionControl() {
  const [phase, setPhase] = useState<Phase>("PROTECT")
  const [threshold, setThreshold] = useState([98])
  const [isPanic, setIsPanic] = useState(false)

  const events = [
    { id: "1", time: "14:02:01", message: "Circuit Breaker Triggered: STX Depeg Detected", type: "trigger" as const },
    { id: "2", time: "14:02:02", message: "Withdrawing assets from Zest Protocol...", type: "action" as const },
    { id: "3", time: "14:02:05", message: "Funds secured in Aegis Vault", type: "success" as const },
  ]

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-all duration-300 ${isPanic ? "border-t-[12px] border-panic" : "border-t-[12px] border-stacks"}`}>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic">MISSION CONTROL</h1>
          <p className="mono text-xs font-bold text-muted-foreground">Stacks Aegis Institutional Guard | Version 2.0.0-react</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Connect Wallet</Button>
          <Button size="sm" className="bg-stacks text-white hover:bg-stacks/90" onClick={() => setIsPanic(!isPanic)}>
            {isPanic ? "STOP SIMULATION" : "SIMULATE PANIC"}
          </Button>
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
                  <label className="text-[10px] font-black uppercase">Threshold: &lt; 0.{threshold[0]}</label>
                  <span className="mono text-[10px] font-bold">BALANCED</span>
                </div>
                <Slider 
                  value={threshold} 
                  onValueChange={setThreshold} 
                  max={99} 
                  min={95} 
                  step={1} 
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight italic">
                Balanced Profile: Faster exits, moderate yield interruption risk.
              </p>
              <Button className="w-full" onClick={() => setPhase("MONITOR")}>Apply Configuration</Button>
            </CardContent>
          </Card>

          <RiskRadar />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {isPanic ? (
            <div className="space-y-6">
              <Alert variant="destructive">
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
                  <EventTimeline events={events} />
                </CardContent>
              </Card>
              <div className="flex gap-4">
                <Button className="flex-1 bg-safe text-white hover:bg-safe/90" onClick={() => setIsPanic(false)}>RE-ENTER POOLS</Button>
                <Button variant="outline" className="flex-1">WITHDRAW TO WALLET</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StabilityScoreGauge score={isPanic ? 42 : 98} />
                <Card className="flex flex-col justify-center items-center text-center">
                  <Activity className="h-12 w-12 mb-2 text-stacks" />
                  <p className="font-black text-2xl">NOMINAL</p>
                  <p className="mono text-[10px] font-bold">SYSTEM STATUS</p>
                </Card>
              </div>
              <VaultExposure />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

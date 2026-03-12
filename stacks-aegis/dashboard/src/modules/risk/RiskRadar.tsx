import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VaultData } from "../../hooks/useVaultData"

interface RiskRadarProps {
  data?: VaultData;
}

export function RiskRadar({ data }: RiskRadarProps) {
  const protocols = [
    { name: "Bitflow", defaultHealth: 99.8 },
    { name: "Zest Protocol", defaultHealth: 99.5 },
    { name: "Hermetica", defaultHealth: 98.2 },
    { name: "Velar", defaultHealth: 97.5 },
  ]

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-sm">Stacks Risk Radar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {protocols.map((p) => {
          const health = data?.protocolScores?.[p.name] ?? p.defaultHealth;
          let status = "Stable";
          let color = "safe";
          if (health < 90) { status = "High Vol"; color = "warning"; }
          else if (health < 98) { status = "Monitoring"; color = "warning"; }

          return (
            <div key={p.name} className="flex items-center justify-between border-b-2 border-black/5 pb-2 last:border-0 last:pb-0">
              <div>
                <p className="font-bold text-xs uppercase">{p.name}</p>
                <p className="text-[10px] mono">
                  {data?.isLoading ? "SYNCING..." : `${health}% HEALTH`} 
                  {data?.lastUpdatedBlock ? ` • BLK ${data.lastUpdatedBlock}` : ""}
                </p>
              </div>
              <Badge variant={color as any}>{status}</Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

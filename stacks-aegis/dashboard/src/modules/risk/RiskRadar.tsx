import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const protocols = [
  { name: "Bitflow", status: "Stable", health: 99.8, color: "safe" },
  { name: "Zest Protocol", status: "Active", health: 99.5, color: "safe" },
  { name: "Hermetica", status: "Monitoring", health: 98.2, color: "warning" },
  { name: "Velar", status: "High Vol", health: 97.5, color: "warning" },
]

export function RiskRadar() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-sm">Stacks Risk Radar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {protocols.map((p) => (
          <div key={p.name} className="flex items-center justify-between border-b-2 border-black/5 pb-2 last:border-0 last:pb-0">
            <div>
              <p className="font-bold text-xs uppercase">{p.name}</p>
              <p className="text-[10px] mono">{p.health}% HEALTH</p>
            </div>
            <Badge variant={p.color as any}>{p.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

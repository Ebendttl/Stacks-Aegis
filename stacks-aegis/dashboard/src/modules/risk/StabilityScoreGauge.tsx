import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StabilityScoreProps {
  score: number
}

export function StabilityScoreGauge({ score }: StabilityScoreProps) {
  const getScoreColor = (s: number) => {
    if (s > 90) return "text-safe"
    if (s > 70) return "text-warning"
    return "text-panic"
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Stability Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-0">
        <div className={`text-6xl font-black transition-colors ${getScoreColor(score)}`}>
          {score}%
        </div>
        <p className="text-[10px] mono mt-2 font-bold uppercase tracking-widest text-muted-foreground">
          Current Risk Index: {score > 90 ? "NOMINAL" : score > 70 ? "ELEVATED" : "CRITICAL"}
        </p>
      </CardContent>
    </Card>
  )
}

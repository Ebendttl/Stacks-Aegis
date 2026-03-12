import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

interface StabilityScoreProps {
  score: number;
}

export function StabilityScoreGauge({ score }: StabilityScoreProps) {
  // Simple representation
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Stability Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-6xl font-black">{score}</span>
          <span className="text-xl font-bold mb-2">/100</span>
        </div>
        <div className="w-full h-4 border-2 border-black mt-4 bg-gray-100">
           <div 
            className="h-full bg-stacks transition-all duration-1000" 
            style={{ width: `${score}%` }}
           />
        </div>
        <div className="mt-4 flex items-center justify-between text-[10px] font-bold">
           <div className="flex items-center gap-1">
             <Shield className="h-3 w-3" />
             ALGORITHMIC HEALTH
           </div>
           <span className={score > 90 ? "text-green-600" : "text-stacks"}>
             {score > 90 ? "OPTIMAL" : "STABLE"}
           </span>
        </div>
      </CardContent>
    </Card>
  )
}

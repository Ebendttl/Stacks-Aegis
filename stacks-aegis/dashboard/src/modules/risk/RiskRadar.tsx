import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Crosshair, AlertTriangle } from "lucide-react"

interface RiskRadarProps {
  data?: any; // Using any for simplicity in this sweep, can be typed properly later
}

export function RiskRadar({ data }: RiskRadarProps) {
  const stability = data?.stabilityScore || 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Risk Perimeters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span className="text-[10px] font-bold uppercase">Contract Integrity</span>
          </div>
          <Badge className="rounded-none bg-green-100 text-green-700 border border-green-700">SECURE</Badge>
        </div>

        <div className="flex justify-between items-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-stacks" />
            <span className="text-[10px] font-bold uppercase">L1 Sync Status</span>
          </div>
          <Badge className="rounded-none bg-blue-100 text-blue-700 border border-blue-700">NOMINAL</Badge>
        </div>

        <div className="flex justify-between items-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-[10px] font-bold uppercase">Slippage Threshold</span>
          </div>
          <Badge className="rounded-none bg-orange-100 text-orange-700 border border-orange-700">{stability >= 90 ? "LOW" : "ELEVATED"}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

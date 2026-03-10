import React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const positions = [
  { asset: "stSTX", amount: "12,450", value: "$24,900", yield: "7.2%", status: "Secured" },
  { asset: "USDA", amount: "5,000", value: "$5,000", yield: "12.5%", status: "Active" },
]

export function VaultExposure() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Vault Exposure & Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Yield</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((pos) => (
              <TableRow key={pos.asset}>
                <TableCell className="font-bold">{pos.asset}</TableCell>
                <TableCell className="mono">{pos.amount}</TableCell>
                <TableCell className="mono">{pos.value}</TableCell>
                <TableCell className="mono text-safe font-bold">{pos.yield}</TableCell>
                <TableCell>
                  <Badge variant={pos.status === "Secured" ? "safe" : "default" as any}>
                    {pos.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

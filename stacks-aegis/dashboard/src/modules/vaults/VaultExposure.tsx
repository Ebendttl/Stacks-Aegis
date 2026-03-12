import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VaultData } from "../../hooks/useVaultData"
import { useWalletStore } from "../dashboard/WalletConnect"
import { txWithdraw, txSafeWithdraw, txReEnterProtection } from "../../lib/transactions"

export function VaultExposure({ data }: { data?: VaultData & { refetch?: () => void } }) {
  const { isConnected } = useWalletStore();

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader><CardTitle className="text-sm">Vault Exposure & Positions</CardTitle></CardHeader>
        <CardContent className="py-6 text-center text-muted-foreground font-bold">
          Connect wallet to view positions
        </CardContent>
      </Card>
    );
  }

  const hasVault = (data?.userVaultBalance || 0) > 0;
  const hasSafe = (data?.userSafeBalance || 0) > 0;

  if (!hasVault && !hasSafe) {
    return (
      <Card className="w-full">
        <CardHeader><CardTitle className="text-sm">Vault Exposure & Positions</CardTitle></CardHeader>
        <CardContent className="py-6 text-center text-muted-foreground font-bold italic">
          No active positions
        </CardContent>
      </Card>
    );
  }

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
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasVault && (
              <TableRow>
                <TableCell className="font-bold">sBTC</TableCell>
                <TableCell className="mono">{data?.userVaultBalance}</TableCell>
                <TableCell className="mono font-bold">Aegis Vault</TableCell>
                <TableCell>
                  <Badge variant="safe">Active</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" className="h-7 text-xs border-2 border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]" onClick={() => txWithdraw(data!.userVaultBalance, () => data?.refetch?.())}>
                    Withdraw
                  </Button>
                </TableCell>
              </TableRow>
            )}
            {hasSafe && (
              <TableRow>
                <TableCell className="font-bold">sBTC</TableCell>
                <TableCell className="mono">{data?.userSafeBalance}</TableCell>
                <TableCell className="mono font-bold text-destructive">Safe Vault</TableCell>
                <TableCell>
                  <Badge variant="destructive">Secured</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={data?.breakerActive}
                      className="h-7 text-xs border-2 border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] disabled:opacity-50" 
                      onClick={() => txReEnterProtection(data!.userSafeBalance, !!data?.breakerActive, () => data?.refetch?.())}
                    >
                      Re-enter Pools
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="h-7 text-xs border-2 border-black rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)]" 
                      onClick={() => txSafeWithdraw(data!.userSafeBalance, () => data?.refetch?.())}
                    >
                      Withdraw
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

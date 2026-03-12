import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { VaultData } from "../../hooks/useVaultData"
import { useWalletStore } from "../dashboard/WalletConnect"
import { txDeposit, txWithdraw, txSafeWithdraw, txReEnterProtection, toast } from "../../lib/transactions"
import { Loader2, ShieldAlert, ShieldCheck, Wallet } from "lucide-react"

type Strategy = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';

const STRATEGIES: Record<Strategy, { label: string; desc: string; threshold: number }> = {
  CONSERVATIVE: { label: 'CONSERVATIVE', desc: 'Exit at < 0.97 peg', threshold: 97 },
  BALANCED: { label: 'BALANCED', desc: 'Exit at < 0.95 peg', threshold: 95 },
  AGGRESSIVE: { label: 'AGGRESSIVE', desc: 'Exit at < 0.93 peg', threshold: 93 },
};

export function VaultExposure({ data }: { data: VaultData }) {
  const { isConnected } = useWalletStore();
  const [amount, setAmount] = useState('');
  const [strategy, setStrategy] = useState<Strategy>('BALANCED');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const handleDeposit = async () => {
    setError('');
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    const microUnits = Math.floor(numAmount * 100000000); // 8 decimals for sBTC
    if (microUnits > data.userSbtcBalance) {
      const max = (data.userSbtcBalance / 100000000).toFixed(8);
      setError(`Amount must be between 0.000001 and ${max} sBTC`);
      return;
    }

    setIsPending(true);
    try {
      await txDeposit(microUnits, () => {
        setIsPending(false);
        setAmount('');
        data.refetch();
      });
    } catch (e) {
      console.error(e);
      setIsPending(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full bg-[#0a0a0a] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none">
        <CardHeader className="border-b-2 border-black">
          <CardTitle className="text-sm font-black text-white italic tracking-[3px]">VAULT EXPOSURE & POSITIONS</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-[#f5a623]" />
          <p className="font-mono text-sm font-bold text-white uppercase tracking-widest">Connect wallet to deposit & view positions</p>
        </CardContent>
      </Card>
    );
  }

  const hasVault = data.userVaultBalance > 0;
  const hasSafe = data.userSafeBalance > 0;

  return (
    <div className="space-y-6">
      {/* PART 2 - New Protected Position Panel */}
      <Card className="w-full bg-[#0a0a0a] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden">
        <CardHeader className="border-b-2 border-black bg-[#111]">
          <CardTitle className="text-sm font-black text-white italic tracking-[3px]">NEW PROTECTED POSITION</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-black text-[#f5a623] uppercase tracking-[2px]">Deposit Amount</label>
              <div className="relative">
                <Input 
                  type="number" 
                  placeholder="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-white border-2 border-black rounded-none font-mono font-bold text-black h-12 focus-visible:ring-0 focus-visible:border-[#f5a623]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-black text-black">sBTC</div>
              </div>
              {error && <p className="font-mono text-[10px] font-bold text-[#ff3030]">{error}</p>}
              <p className="font-mono text-[10px] text-gray-400">Available: {(data.userSbtcBalance / 100000000).toFixed(8)} sBTC</p>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] font-black text-[#f5a623] uppercase tracking-[2px]">Select Strategy</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(STRATEGIES) as Strategy[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setStrategy(key)}
                    className={`p-4 border-2 text-left transition-all duration-200 group ${
                      strategy === key 
                        ? "bg-[#f5a623] border-black shadow-[3px_3px_0px_black] -translate-x-0.5 -translate-y-0.5" 
                        : "bg-[#1a1a1a] border-gray-800 hover:border-gray-600"
                    }`}
                  >
                    <p className={`font-mono text-[10px] font-black uppercase tracking-widest mb-1 ${strategy === key ? "text-black" : "text-white"}`}>
                      {STRATEGIES[key].label}
                    </p>
                    <p className={`font-mono text-[10px] italic ${strategy === key ? "text-black" : "text-gray-400"}`}>
                      {STRATEGIES[key].desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-14 bg-black border-2 border-[#f5a623] text-[#f5a623] hover:bg-[#f5a623] hover:text-black rounded-none font-mono font-black text-lg tracking-[4px] shadow-[4px_4px_0px_rgba(245,166,35,0.2)] disabled:opacity-50 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              onClick={handleDeposit}
              disabled={isPending || !amount}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AWAITING SIGNATURE...
                </span>
              ) : (
                "DEPOSIT & PROTECT"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Positions Table */}
      <Card className="w-full bg-white border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none">
        <CardHeader className="border-b-2 border-black">
          <CardTitle className="text-sm font-black italic tracking-[3px]">ACTIVE POSITIONS</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!hasVault && !hasSafe ? (
            <div className="py-12 text-center space-y-2">
              <p className="font-mono text-sm font-bold text-gray-500 italic uppercase">No active positions</p>
              <p className="font-mono text-[10px] text-gray-400">↑ Make your first deposit above to start protecting your Bitcoin.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b-2 border-black hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] font-black text-black border-r-2 border-black uppercase">Asset</TableHead>
                  <TableHead className="font-mono text-[10px] font-black text-black border-r-2 border-black uppercase">Amount (sBTC)</TableHead>
                  <TableHead className="font-mono text-[10px] font-black text-black border-r-2 border-black uppercase">Location</TableHead>
                  <TableHead className="font-mono text-[10px] font-black text-black border-r-2 border-black uppercase">Status</TableHead>
                  <TableHead className="font-mono text-[10px] font-black text-black text-right uppercase">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasVault && (
                  <TableRow className="border-b-2 border-black hover:bg-gray-50 group">
                    <TableCell className="font-black border-r-2 border-black">sBTC</TableCell>
                    <TableCell className="font-mono font-bold border-r-2 border-black">
                      {(data.userVaultBalance / 100000000).toFixed(8)}
                    </TableCell>
                    <TableCell className="font-mono font-black border-r-2 border-black uppercase text-xs">Aegis Vault</TableCell>
                    <TableCell className="border-r-2 border-black">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-[#00ff88]" />
                        <span className="font-mono text-[10px] font-black text-[#00ff88] uppercase">Protected</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant={data.breakerActive ? "destructive" : "outline"}
                        className={`font-mono font-black text-[10px] rounded-none border-2 border-black shadow-[2px_2px_0px_black] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                          data.breakerActive ? "bg-[#ff3030] text-white" : "bg-white text-black hover:bg-black hover:text-white"
                        }`}
                        onClick={() => txWithdraw(data.userVaultBalance, () => data.refetch())}
                      >
                        {data.breakerActive ? "EMERGENCY EXIT" : "WITHDRAW"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
                {hasSafe && (
                  <TableRow className="border-b-2 border-black bg-gray-50 hover:bg-gray-100 italic">
                    <TableCell className="font-black border-r-2 border-black opacity-50 text-gray-500">sBTC</TableCell>
                    <TableCell className="font-mono font-bold border-r-2 border-black opacity-50 text-gray-500">
                      {(data.userSafeBalance / 100000000).toFixed(8)}
                    </TableCell>
                    <TableCell className="font-mono font-black border-r-2 border-black uppercase text-xs text-red-600">Safe Vault</TableCell>
                    <TableCell className="border-r-2 border-black">
                      <div className="flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3 text-[#ff3030]" />
                        <span className="font-mono text-[10px] font-black text-[#ff3030] uppercase">Secured</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right italic text-xs font-bold text-gray-400">
                      See recovery panel below
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* PART 3 - Safe Vault Recovery Panel */}
      {hasSafe && (
        <Card className="w-full bg-[#111] border-2 border-[#ff3030] shadow-[4px_4px_0px_rgba(255,48,48,0.2)] rounded-none animate-pulse-subtle">
          <CardHeader className="border-b-2 border-[#ff3030] bg-[#1a0a0a]">
            <CardTitle className="text-sm font-black text-[#ff3030] flex items-center gap-2 italic tracking-[3px]">
              <ShieldAlert className="h-4 w-4" />
              ⚠ FUNDS IN SAFE VAULT
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="font-mono text-xs font-bold text-white">
              <span className="text-[#ff3030] font-black">{(data.userSafeBalance / 100000000).toFixed(8)} sBTC</span> secured during emergency exit.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                variant="outline"
                className="flex-1 bg-white border-2 border-black text-black rounded-none font-mono font-black text-xs tracking-widest shadow-[4px_4px_0px_black] hover:bg-gray-100 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                onClick={() => txSafeWithdraw(data.userSafeBalance, () => data.refetch())}
              >
                WITHDRAW TO WALLET
              </Button>
              <Button 
                variant="outline"
                disabled={data.breakerActive}
                className={`flex-1 border-2 border-black rounded-none font-mono font-black text-xs tracking-widest shadow-[4px_4px_0px_black] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                  data.breakerActive 
                    ? "bg-gray-800 text-gray-500 border-gray-700 shadow-none cursor-not-allowed" 
                    : "bg-[#00ff88] text-black hover:bg-[#00cc6e]"
                }`}
                onClick={() => txReEnterProtection(data.userSafeBalance, data.breakerActive, () => data.refetch())}
              >
                RE-ENTER PROTECTION
              </Button>
            </div>
            <p className="font-mono text-[10px] text-gray-500 text-center">
              Your funds are secured on-chain in the Aegis Safe Vault. No action is required — withdraw at any time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

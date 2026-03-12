import { useEffect, useState } from 'react';
import { Activity, Eye, Zap, Shield, CheckCircle2, Menu, ExternalLink, Twitter, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { RiskRadar } from "../risk/RiskRadar"
import { StabilityScoreGauge } from "../risk/StabilityScoreGauge"
import { VaultExposure } from "../vaults/VaultExposure"
import { EventTimeline } from "./EventTimeline"
import { WalletConnect, useWalletStore } from "./WalletConnect"
import { useVaultData } from "../../hooks/useVaultData"
import { openContractCall, showConnect } from "@stacks/connect"
import { uintCV } from "@stacks/transactions"
import { network, CONTRACT_ADDRESSES, userSession } from "../../lib/stacks-client"
import { toast, txWithdraw } from "../../lib/transactions"
import Logo from "../../assets/aegis-logo.svg"

export function MissionControl() {
  const { isConnected, address } = useWalletStore()
  const vaultData = useVaultData()
  const [threshold, setThreshold] = useState([vaultData.threshold || 95])
  
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

  const handleSimulatePanic = () => {
    const [addr, name] = CONTRACT_ADDRESSES.riskOracle.split('.')
    openContractCall({
      network,
      contractAddress: addr,
      contractName: name,
      functionName: 'simulate-panic',
      functionArgs: [],
      onFinish: () => {
        toast("Panic simulation triggered. Circuit breaker will arm within 1 block.")
        vaultData.refetch()
      }
    })
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-mono selection:bg-[#f5a623] selection:text-black">
      {/* SECTION 2 — Professional Header */}
      <header className="fixed top-0 left-0 w-full z-[100] bg-[#0a0a0a] border-b-2 border-[#f5a623] shadow-[0_4px_0_#f5a62322] px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={Logo} alt="Aegis Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-bold tracking-[4px] text-[#f5a623] leading-none">STACKS AEGIS</h1>
            <p className="text-[9px] tracking-[3px] text-gray-400 mt-1">BITCOIN CIRCUIT BREAKER</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#dashboard" className="nav-link active">DASHBOARD</a>
          <a href="#how-it-works" className="nav-link">HOW IT WORKS</a>
          <a href="#security" className="nav-link">SECURITY</a>
          <a href="https://github.com" target="_blank" className="nav-link flex items-center gap-1">DOCS <ExternalLink size={10} /></a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[9px] text-[#f5a623] border border-[#f5a623] px-1.5 py-0.5 font-bold mb-1">TESTNET</span>
            {vaultData.lastUpdatedBlock > 0 && (
              <span className="text-[9px] text-gray-500">BLOCK: #{vaultData.lastUpdatedBlock}</span>
            )}
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleSimulatePanic}
            className="hidden sm:flex bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-black shadow-[4px_4px_0_#000] text-[10px] h-8"
          >
            SIMULATE PANIC
          </Button>
          <WalletConnect />
          <Button variant="ghost" size="icon" className="md:hidden text-white">
            <Menu />
          </Button>
        </div>
      </header>

      {/* SECTION 3 — Hero Section */}
      <section className="relative min-h-[80vh] flex items-center px-16 pt-32 pb-20 overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#f5a62308 1px, transparent 1px), linear-gradient(90deg, #f5a62308 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full max-w-7xl mx-auto">
          <div>
            <p className="text-[#f5a623] text-[10px] tracking-[4px] font-bold mb-6">STACKS ENDOWMENT — GRANT PROPOSAL 2026</p>
            <h2 className="hero-headline mb-8">
              BITCOIN<br/>NEVER<br/>SLEEPS.
            </h2>
            <p className="text-gray-400 text-sm max-width-[480px] mb-10 leading-relaxed italic">
              Neither does Aegis. Automated principal protection for sBTC — the circuit breaker that pulls your Bitcoin to safety before you even wake up.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Button className="btn-brutal-primary h-auto py-4">PROTECT MY BITCOIN</Button>
              <Button className="btn-brutal-secondary h-auto py-4">READ THE DOCS</Button>
            </div>

            <div className="flex gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold mb-1">STABILITY SCORE</span>
                <span className="text-[#f5a623] font-bold">{vaultData.stabilityScore}/100</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold mb-1">REACTION TIME</span>
                <span className="text-white font-bold">{"<"} 2 BLOCKS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold mb-1">GOVERNANCE</span>
                <span className="text-white font-bold">ZERO ADMIN KEYS</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative group">
               <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${vaultData.breakerActive ? 'bg-red-500' : 'bg-[#f5a623] group-hover:opacity-30'}`}></div>
               <div className="w-[300px] h-[300px] relative z-10">
                 <StabilityScoreGauge score={vaultData.stabilityScore} />
               </div>
            </div>
            <div className={`mt-12 flex items-center gap-3 px-6 py-2 border-2 border-current font-bold tracking-[2px] text-sm ${vaultData.breakerActive ? 'text-red-500 animate-pulse' : 'text-[#f5a623]'}`}>
               <Activity size={18} />
               SYSTEM STATUS: {vaultData.breakerActive ? 'CRITICAL' : 'NOMINAL'}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Dashboard Grid */}
      <main id="dashboard" className="dashboard-grid bg-[#0a0a0a]">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="brutal-card h-[380px]">
            <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-6 uppercase">Active Protection</h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-[#f5a623]">Threshold: {"<"} 0.{threshold[0]}</label>
                  <span className="text-[10px] text-white bg-black px-2 py-0.5 border border-[#2a2a2a]">BALANCED</span>
                </div>
                <Slider 
                  value={threshold} 
                  onValueChange={setThreshold} 
                  max={99} 
                  min={0} 
                  step={1} 
                  className="py-4"
                />
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed italic border-l-2 border-[#f5a623] pl-4">
                Balanced Profile: Faster exits, moderate yield interruption risk. High sensitivity to peg deviation.
              </p>
              <Button 
                onClick={handleApplyConfig} 
                className="w-full bg-[#f5a623] text-black border-2 border-black font-bold uppercase shadow-[4px_4px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_#000]"
              >
                APPLY CONFIGURATION
              </Button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto brutal-card">
             <RiskRadar data={vaultData} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
             {vaultData.breakerActive ? (
                <div className="col-span-2 brutal-card border-red-600 shadow-[4px_4px_0_#991b1b] bg-[#1a0b0b]">
                   <h3 className="text-red-500 font-black italic text-lg mb-2">EMERGENCY SYSTEM ACTIVATED</h3>
                   <p className="text-xs text-red-400 font-bold leading-relaxed">
                     Automated withdrawal sequence in progress. Your Bitcoin principal is being redirected to the secure Aegis safe-vault.
                   </p>
                   <div className="mt-6 flex gap-4">
                      <Button variant="outline" className="flex-1 border-white text-white hover:bg-white/10"
                        onClick={() => txWithdraw(vaultData.userVaultBalance, () => vaultData.refetch())}>
                        RECOVER TO WALLET
                      </Button>
                      <Button variant="outline" className="flex-1 border-white/20 text-white/50" disabled>
                        RE-ENTER PROTECTION
                      </Button>
                   </div>
                </div>
             ) : (
                <>
                  <div className="brutal-card flex flex-col items-center justify-center text-center">
                    <StabilityScoreGauge score={vaultData.stabilityScore} />
                  </div>
                  <div className="brutal-card flex flex-col justify-center items-center text-center">
                    <Activity className={`h-16 w-16 mb-4 ${vaultData.breakerActive ? 'text-red-500' : 'text-[#f5a623]'}`} />
                    <p className="font-black text-3xl">NOMINAL</p>
                    <p className="text-[10px] font-bold text-gray-500 tracking-[3px] mt-2">SYSTEM STATUS</p>
                  </div>
                </>
             )}
          </div>

          <div className="brutal-card">
            <VaultExposure data={vaultData} />
          </div>

          <div className="brutal-card">
            <h3 className="text-xs font-bold tracking-widest text-gray-500 mb-6 uppercase">Incident Timeline</h3>
            <EventTimeline />
          </div>
        </div>
      </main>

      {/* SECTION 5 — How It Works */}
      <section id="how-it-works" className="neo-section border-t-2 border-[#2a2a2a] bg-[#0d0d0d]">
        <h2 className="text-center text-4xl font-bold text-[#f5a623] mb-20 tracking-tighter">HOW AEGIS PROTECTS YOUR BITCOIN</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#f5a62322] hidden md:block -translate-y-1/2 z-0"></div>
          
          <div className="brutal-card border-[#f5a623] shadow-[6px_6px_0_#f5a623] relative z-10 bg-[#0d0d0d]">
            <div className="w-12 h-12 bg-[#f5a623] text-black flex items-center justify-center mb-6 font-bold text-xl">01</div>
            <Eye size={48} className="text-[#f5a623] mb-6" />
            <h4 className="text-xl font-bold mb-2">SENSE</h4>
            <p className="text-[#f5a623] text-xs font-bold mb-4">Risk Oracle</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Aggregates price data from Pyth and RedStone every block. Calculates a real-time Stability Score for sBTC peg integrity.
            </p>
          </div>

          <div className="brutal-card border-[#f5a623] shadow-[6px_6px_0_#f5a623] relative z-10 bg-[#0d0d0d]">
             <div className="w-12 h-12 bg-[#f5a623] text-black flex items-center justify-center mb-6 font-bold text-xl">02</div>
             <Zap size={48} className="text-[#f5a623] mb-6" />
             <h4 className="text-xl font-bold mb-2">THINK</h4>
             <p className="text-[#f5a623] text-xs font-bold mb-4">Aegis Vault</p>
             <p className="text-gray-400 text-xs leading-relaxed">
               Compares the Stability Score against your personal Panic Threshold. Automatically arms the circuit breaker if compromised.
             </p>
          </div>

          <div className="brutal-card border-[#f5a623] shadow-[6px_6px_0_#f5a623] relative z-10 bg-[#0d0d0d]">
             <div className="w-12 h-12 bg-[#f5a623] text-black flex items-center justify-center mb-6 font-bold text-xl">03</div>
             <Shield size={48} className="text-[#f5a623] mb-6" />
             <h4 className="text-xl font-bold mb-2">ACT</h4>
             <p className="text-[#f5a623] text-xs font-bold mb-4">Safe Vault</p>
             <p className="text-gray-400 text-xs leading-relaxed">
               Executes emergency withdrawal. Your sBTC tokens move to the Safe Vault in under 2 blocks — no manual action required.
             </p>
          </div>
        </div>
      </section>

      {/* SECTION 6 — Security */}
      <section id="security" className="neo-section bg-[#0a0a0a]">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-16 tracking-tighter">SECURITY MODEL</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { title: "NO ADMIN DRAIN KEY", desc: "No single wallet can withdraw user funds. Only the user can." },
                 { title: "POST-CONDITIONS ON EVERY TX", desc: "Clarity post-conditions prevent any unexpected token movement." },
                 { title: "ZERO UNWRAP-PANIC", desc: "Every contract error uses named constants. No silent failures." },
                 { title: "SAFE VAULT WHITELIST", desc: "Only aegis-vault.clar can deposit into the emergency safe-vault." },
                 { title: "TIME-LOCK GOVERNANCE", desc: "All parameter changes require a time delay. No rug-pull mechanics." },
               ].map((item, i) => (
                 <div key={i} className="bg-[#111] border-l-4 border-[#f5a623] p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                       <CheckCircle2 className="text-[#00ff88] mt-1 shrink-0" size={20} />
                       <div>
                          <h5 className="font-bold text-sm mb-2">{item.title}</h5>
                          <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* SECTION 7 — Professional Footer */}
      <footer className="bg-[#0a0a0a] border-t-4 border-[#f5a623] pt-20 pb-10 px-16">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 max-w-7xl mx-auto">
            <div>
               <div className="flex items-center gap-3 mb-6">
                 <img src={Logo} alt="Logo" className="w-8 h-8" />
                 <span className="font-bold tracking-[3px] text-sm">STACKS AEGIS</span>
               </div>
               <p className="text-xs text-gray-500 leading-relaxed mb-6">
                 Building the security layer for the Bitcoin economy. Decentralized principal protection.
               </p>
               <p className="text-[10px] text-gray-600">
                 © 2026 Stacks Aegis. Built on Stacks L2.
               </p>
            </div>

            <div>
               <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Protocol</h5>
               <ul className="space-y-4 text-xs">
                  <li><a href="#" className="text-gray-500 hover:text-[#f5a623]">Architecture</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#f5a623]">Security Model</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#f5a623]">Grant Proposal</a></li>
                  <li><a href="https://github.com" className="text-gray-500 hover:text-[#f5a623]">GitHub Repo</a></li>
               </ul>
            </div>

            <div>
               <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Built With</h5>
               <ul className="space-y-4 text-xs text-gray-500">
                  <li>Clarity 4.0</li>
                  <li>React + TypeScript</li>
                  <li>Clarinet Framework</li>
                  <li>Antigravity IDE</li>
               </ul>
            </div>

            <div>
               <h5 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-6">Grant Support</h5>
               <p className="text-xs text-gray-500 mb-6">
                 Submitted to Stacks Endowment January 2026 cycle. Category: Engineering & Security.
               </p>
               <div className="flex gap-4">
                  <a href="#" className="text-gray-400 hover:text-[#f5a623]"><Twitter size={18} /></a>
                  <a href="#" className="text-gray-400 hover:text-[#f5a623]"><Github size={18} /></a>
               </div>
               <p className="text-[10px] text-gray-600 mt-6 font-bold">
                 BUILDER: @Ebendttl
               </p>
            </div>
         </div>

         <div className="border-t border-[#2a2a2a] pt-10 flex justify-between items-center max-w-7xl mx-auto">
            <span className="text-[9px] text-gray-600 tracking-[2px] font-bold">TESTNET DEPLOYMENT — NOT FOR PRODUCTION USE</span>
            <span className="text-[9px] text-gray-600 tracking-[2px]">Open Source. Community First. No VC funding.</span>
         </div>
      </footer>
    </div>
  );
}

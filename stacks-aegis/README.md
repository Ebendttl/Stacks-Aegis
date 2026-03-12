# 🛡️ Stacks Aegis: The Institutional Guard

> **Algorithmic Principal Protection for the Stacks DeFi Ecosystem**

![Testnet Deployed](https://img.shields.io/badge/Stacks-Testnet%20Deployed-indigo) ![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## What is Stacks Aegis?
Stacks Aegis is an automated, decentralized circuit breaker designed to unconditionally protect institutional principal capital (`sBTC`) across Stacks DeFi. While yield aggregators optimize for compounding returns, Aegis acts as a strict firewall that instantly evacuates liquidity into an inert Safe Vault during specific failure states—such as an oracle depeg or protocol insolvency. It provides piece of mind for heavy-capital deployments looking to access native Bitcoin yield without exposing their principal to catastrophic contract drain risks.

## How it Works

Stacks Aegis executes a decoupled **Sense-Think-Act** architecture across three primary functional zones, regulated tightly by strict interface Traits:

```text
[Risk Oracle] ──stability score──▶ [Aegis Vault] ──emergency exit──▶ [Safe Vault]
     │                                   │                                  │
  "The Brain"                       "The Shield"                      "The Refuge"
```

1.  **The Brain (`risk-oracle`):** Aggregates cross-chain decentralized price feeds and historical liquidity depth into a single `0-100` normalization score representing the current health of the `sBTC` peg and associated integrations.
2.  **The Shield (`aegis-vault`):** The primary user interface. Users deposit `sBTC` into this gateway. It allows capital deployment but maintains a rigid heartbeat-check against the Risk Oracle. If the score falls below a user's defined risk threshold, the circuit breaker trips.
3.  **The Refuge (`safe-vault`):** Upon a tripped circuit breaker, all `sBTC` within the shield is forcefully and algorithmically evacuated into this isolated, mathematically inert vault. Capital inside The Refuge cannot be yield-farmed, staked, or rehypothecated. It can only be cleanly withdrawn back to the originating wallet.

## Quick Start

```bash
git clone https://github.com/Ebendttl/Stacks-Aegis
cd Stacks-Aegis
clarinet check         # verify contracts compile
clarinet test          # run full test suite
cd dashboard && npm install && npm run dev:testnet
```

## Contract Addresses (Testnet)

All core protocols are fully verified and deployed on the Stacks Testnet.

| Component | Contract Address | Explorer Link |
| :--- | :--- | :--- |
| **Aegis Traits** | `STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.aegis-traits` | [View on Hiro Explorer](https://explorer.hiro.so/txid/STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.aegis-traits?chain=testnet) |
| **Risk Oracle** | `STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.risk-oracle` | [View on Hiro Explorer](https://explorer.hiro.so/txid/STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.risk-oracle?chain=testnet) |
| **Safe Vault** | `STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.safe-vault` | [View on Hiro Explorer](https://explorer.hiro.so/txid/STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.safe-vault?chain=testnet) |
| **Aegis Vault** | `STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.aegis-vault` | [View on Hiro Explorer](https://explorer.hiro.so/txid/STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.aegis-vault?chain=testnet) |
| **SIP-010 Mock** | `STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.mock-sbtc` | [View on Hiro Explorer](https://explorer.hiro.so/txid/STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6.mock-sbtc?chain=testnet) |

## Security Model
A full breakdown of the Threat Model, architectural limitations, mitigation strategies, and formal mainnet launch prerequisites can be found in our [Security Model Documentation](grant-submission/SECURITY_MODEL.md).

## Grant Status
Stacks Aegis is currently participating in the **Stacks Endowment January 2026** cycle. Our comprehensive protocol definitions, integration scopes, and funding milestones map directly to the requirements of the ecosystem, which are thoroughly documented inside our grant submission artifacts directory. 

## Contributing
We welcome open-source contributions. Specifically, we are actively looking for integration PRs from other emerging Stacks DeFi protocols seeking to independently query and respond to the Aegis Risk Oracle score index. If you are building a lending platform, DEX, or yield strategy that requires objective sBTC health data, please open an issue to discuss API integration standards.

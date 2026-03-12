# 🛡️ Stacks-Aegis: The Institutional Guard

> **Algorithmic Principal Protection for the Stacks DeFi Ecosystem**

![Testnet Deployed](https://img.shields.io/badge/Stacks-Testnet%20Deployed-indigo) ![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Overview

**Stacks-Aegis** is a decentralized risk-management protocol specifically designed for the Stacks ecosystem. While current DeFi applications focus heavily on optimizing and generating yield, Aegis strictly focuses on **principal protection**. It provides an automated "Circuit Breaker" and an on-chain "Risk Oracle" for `sBTC`, designed to give users and institutions the ability to automatically evacuate risky positions if a protocol exploit, liquidity crisis, or a de-peg event is detected.

For heavy-capital deployments looking to access native Bitcoin yield, Stacks-Aegis provides the necessary peace of mind without exposing principal liquidities to catastrophic smart contract drain risks or oracle manipulation.

---

## The Problem vs. The Solution

**The Problem:** Most yield aggregators chase basis points by compounding risks across multiple lending and borrowing protocols. When a "black swan" event occurs (e.g., protocol hacks, severe market de-pegs), users are forced to manually react to Twitter alerts at 3 AM to rescue their funds, often failing to do so before liquidity is drained.

**The Solution:** Stacks-Aegis actively monitors the health of the ecosystem through a decoupled Sense-Think-Act architecture. It mathematically limits downside by subordinating yield optimization entirely to absolute principal protection, reacting automatically via on-chain contract logic before human intervention is even possible.

---

## Core Architecture (Sense-Think-Act)

Stacks-Aegis consists of three primary functional zones, regulated tightly by strict interface Traits:

```text
[Risk Oracle] ──stability score──▶ [Aegis Vault] ──emergency exit──▶ [Safe Vault]
     │                                   │                                  │
  "The Brain"                       "The Shield"                      "The Refuge"
```

### 1. The Brain (`risk-oracle.clar`)
Aggregates cross-chain decentralized price feeds (e.g., Pyth, RedStone) and historical liquidity depth into a single, normalized `0-100` stability score. This score transparently represents the current health of the `sBTC` peg and associated integrations.

### 2. The Shield (`aegis-vault.clar`)
The primary gateway for users. Users deposit `sBTC` into this contract, which allows capital to be deployed toward yield strategies. The Shield maintains a constant heartbeat-check against the Risk Oracle. If the stability score falls below the user's defined risk threshold, the circuit breaker trips.

### 3. The Refuge (`safe-vault.clar`)
If the circuit breaker is triggered, all `sBTC` within The Shield is forcefully and algorithmically evacuated into this isolated, mathematically inert vault. Capital inside The Refuge cannot be yield-farmed, staked, or rehypothecated. It can only be cleanly withdrawn back to the originating user's wallet.

---

## Key Features

- **Automated Response:** No multi-sig approval or human admin is required to trigger an emergency evacuation; operations are strictly evaluated against transparent Oracle logic.
- **Universal Post-Condition Enforcement:** Every state-mutating transfer enforces `FungiblePostCondition` payloads on the client and SIP-010 validation on-chain, eliminating silent transfer failures.
- **Zero Panic Terminations:** The codebase enforces strict adherence to explicit `unwrap!` and robust error handling logic, guaranteeing predictable execution and zero `unwrap-panic` mid-flight halts.
- **Inert Safe Vault Design:** The Safe Vault behaves as a pure algorithmic cage. It rejects any inbound and outbound transfers that do not explicitly originate from the Aegis pipeline.

---

## Quick Start (Testnet)

You can run the full test suite and spin up the frontend Mission Control dashboard using the commands below:

```bash
# Clone the repository
git clone https://github.com/Ebendttl/Stacks-Aegis
cd Stacks-Aegis/stacks-aegis

# Verify contracts compile successfully
clarinet check

# Run the full test suite (100% coverage)
clarinet test

# Boot up the Frontend Dashboard on Stacks Testnet
cd dashboard
npm install
npm run dev:testnet
```

---

## Contract Addresses (Testnet)

All core protocols are fully verified and deployed on the Stacks Testnet space.

| Component | Contract Name | Explorer Link |
| :--- | :--- | :--- |
| **Aegis Traits** | `aegis-traits` | [View on Hiro Explorer](https://explorer.hiro.so/?chain=testnet) |
| **Risk Oracle** | `risk-oracle` | [View on Hiro Explorer](https://explorer.hiro.so/?chain=testnet) |
| **Safe Vault** | `safe-vault` | [View on Hiro Explorer](https://explorer.hiro.so/?chain=testnet) |
| **Aegis Vault** | `aegis-vault` | [View on Hiro Explorer](https://explorer.hiro.so/?chain=testnet) |
| **SIP-010 Mock** | `mock-sbtc` | [View on Hiro Explorer](https://explorer.hiro.so/?chain=testnet) |

---

## Security Model

For a complete breakdown of the Threat Model, architectural assumptions, mitigation strategies, and formal mainnet launch prerequisites, please see the [Security Model Documentation](stacks-aegis/grant-submission/SECURITY_MODEL.md).

---

## Grant Status

Stacks-Aegis is participating in the **Stacks Endowment January 2026** cycle. Our comprehensive protocol definitions, integration scopes, and funding milestones are fully documented inside our `grant-submission` directory.

---

## Contributing

We welcome open-source contributions. We are actively looking for integration PRs from other emerging Stacks DeFi protocols seeking to independently query and respond to the Aegis Risk Oracle stability score index. If you are building a lending platform, DEX, or yield strategy that requires objective `sBTC` health data, please open an issue to discuss API integration standards.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

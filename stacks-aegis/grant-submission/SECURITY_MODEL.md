# Stacks Aegis: Security & Threat Model

## Trust Assumptions

Stacks Aegis minimizes absolute trust vectors, but relies operationally on the following foundational assumptions:

1.  **Risk Oracle Accuracy:** The `risk-oracle` aggregates data correctly from underlying off-chain price providers (e.g., Pyth, RedStone). It is assumed that these underlying networks remain honest and uncongested to provide timely sBTC/BTC peg ratios.
2.  **sBridge Asset Integrity:** The value of the underlying SIP-010 token representing sBTC is fully backed exactly 1:1 with native BTC on the layer-1 network.
3.  **Stacks Nakamoto Consensus:** Stacks blocks are reliably produced, confirming `deposit`, `evaluate`, and `withdraw` transactions within acceptable timeframes before catastrophic liquidation parameters are finalized on third-party yield integrations.
4.  **Admin Rectitude (Pre-DAO):** The temporary deployment `ADMIN` principal uses its authorization exclusively to set precise oracle feeds and whitelist contracts.

## Attack Surface Analysis

### 1. `risk-oracle` (The Brain)
*   **Vector:** Malicious Oracle Data Injection. If an attacker gains the `ADMIN` key (or subverts the future DAO), they could artificially report a stability score of 0, forcing a mass protocol evacuation.
*   **Mitigation:** The active architecture averages multiple disparate feeds (Pyth, RedStone, On-Chain depth) requiring a multi-vector subversion strategy. Admin access is strictly checked universally on any `set-` function.
*   **Vector:** Stale Data Execution. Price feeds halt during extreme network congestion, misreporting a healthy peg during a crash.
*   **Mitigation:** (Planned Mainnet) Heartbeat intervals where values older than N-blocks automatically revert to a "0" score, conservatively dumping to the Safe Vault on blindness.

### 2. `aegis-vault` (The Shield)
*   **Vector:** Unauthorized Asset Drain. Contract interactions allowing an attacker to `withdraw` assets mapped to another principal.
*   **Mitigation:** Strict execution of `(is-eq tx-sender sender)` enforced across all SIP-010 transfer validations and map queries.
*   **Vector:** Yield-Rehypothecation Theft. 
*   **Mitigation:** Currently, Aegis acts as an explicitly non-rehypothecating wrapper limiting the attack surface massively by merely holding the token mathematically.

### 3. `safe-vault` (The Refuge)
*   **Vector:** Sweeper Front-running. An attacker calls `sweep-funds` moving assets away from the Safe Vault before users can claim them.
*   **Mitigation:** The Safe Vault strictly rejects all inbound assets and outbound asset controls that do not exactly match the explicit `get-aegis-vault` whitelisted address via `is-whitelist-caller`. It is a true algorithmic cage.

### 4. `aegis-traits` (The Rules)
*   **Vector:** Improper Implementation Binding. Overriding the interface references pointing to malicious SIP-010 implementations.
*   **Mitigation:** Traits are deployed as the absolute first step in the deployment topology. All references use strict `.aegis-traits.sip-010-trait` binding parameters validated explicitly at chain deployment.

## Specific Areas for Professional Audit Focus

A professional smart contract security audit (e.g., CoinFabrik, Least Authority) must exhaustively review the following five specific execution contexts:

1.  **Inter-contract Call Ordering:** Guaranteeing that the sequence of `evaluate-and-trigger` resolving through the Oracle into the Safe Vault cannot be interrupted or suspended midway through state transitions.
2.  **Post-Condition Completeness:** Auditing the exact syntax of the Frontend `Transactions.ts` payloads ensuring absolute compliance with Stacks block validation rules for every single transfer.
3.  **Oracle Manipulation Resistance:** Reviewing the mathematical constraints of the normalization curve preventing out-of-bounds integer overflow attacks.
4.  **Governance Key Exposure:** Ensuring `ADMIN` constraints are universally applied to every operational parameter setter with zero backdoor allowances.
5.  **Reentrancy in the Emergency Exit Path:** Analyzing the `sip-010.transfer` calls executed during `emergency-exit` loops to ensure malicious smart contracts cannot execute reentrant drain loops against the master reserve.

## Known Limitations for Testnet Phase

In the interest of full transparency regarding the current architectural status:
*   The `risk-oracle` currently utilizes hard-coded integer constants and a manual test-setter rather than executing live external oracle node calls.
*   The `ADMIN` governance key executes as a single deployment wallet address rather than a fully verified decentralized DAO multisig.
*   TVL caps and specific yield-farming rehypothecation logic are stubbed/limited in scope to prioritize mastering the exact evacuation pipeline architecture first.

## Mainnet Readiness Checklist

Prior to mainnet transition, the following actions are strictly mandatory:
1.  [ ] Replace mock `risk-oracle` constants with live Pyth/RedStone SIP-010 price feed bindings.
2.  [ ] Complete and resolve a professional third-party independent smart contract code audit.
3.  [ ] Deploy the formal Stacks DAO governance payload terminating the single-key `ADMIN` override.
4.  [ ] Migrate the UI to resolve the `stacks-node-api.mainnet.stacks.co` endpoint.
5.  [ ] Establish formal fallback RPC endpoints for front-end redundancy.
6.  [ ] Conduct an automated volume load-test handling >1,000 concurrent emergency exit operations.
7.  [ ] Refine websocket implementation replacing polling delays.
8.  [ ] Verify final production `sBTC` trait implementation bindings against the confirmed Nakamoto mainnet payload.
9.  [ ] Execute a Bug Bounty program on testnet.
10. [ ] Finalize legal and risk-disclosure disclaimers across the UI deployment.

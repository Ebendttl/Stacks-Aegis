# Stacks Aegis: Baseline Metrics

As part of the Stacks Endowment application process, we commit to establishing and tracking honest architectural, operational, and adoption metrics.

## Current Testnet Baseline (January 2026)

*   **Testnet TVL Protected:** `u500000` sBTC (Verified via `e2e-verification.sh` execution)
*   **Core Clarity Contracts:** `4` (Traits, Oracle, Aegis Vault, Safe Vault) + `1` Mock integration (SIP-010)
*   **Test Coverage:** `100%` (Verified via comprehensive `clarinet test --coverage` pipeline validating zero uncovered execution branches matching positive and negative test constraints).
*   **Lines of Clarity Code:** `~400`
*   **Named Error Constants:** `17` (Demonstrating strict defensive coding discipline, enforcing constant maps rather than inline panics).

## Target KPIs (Milestone Projections)

*   **Milestone 1:** 
    *   *Protection TVL:* N/A (Testnet only)
    *   *Integration Count:* 1 (Internal Mock `sBTC`)
    *   *Reaction Time:* N/A (Algorithmic polling baseline)
*   **Milestone 2:**
    *   *Protection TVL:* N/A (Testnet refinement)
    *   *Integration Count:* 3 (Testnet UI integrations validating data propagation)
    *   *Reaction Time:* <20 Seconds (Evaluating raw websocket latency limits against Dashboard UX updates)
*   **Milestone 3 (Mainnet Launch):**
    *   *Protection TVL:* $1,000,000 equivalent `sBTC` absolute principal.
    *   *Integration Count:* 2 (Formal integrations with tier-1 Stacks yield aggregators querying the Risk Oracle).
    *   *Reaction Time:* < 1 Nakamoto Block duration (Instant state evaluation before yield protocol transaction confirmations).

## What We Are NOT Claiming

To maintain absolute transparency with the Stacks Endowment:

1.  **Oracles are Stubbed:** The current `risk-oracle` operates via static data variables and admin-setter interfaces on testnet. It does NOT currently pull live cross-chain Pyth or RedStone data in real-time. This is specifically deferred to Milestone 3 where reliable contract-to-contract node deployments are confirmed.
2.  **This is Testnet Native:** The deployed network executing `e2e-verification.sh` operates entirely on the Hiro testnet. No Mainnet funds are currently secured.
3.  **No Formal Audit Complete:** While functional tests cover 100% of the code branches logically, we have NOT completed an independent third-party code review. Do NOT deploy mainnet significant TVL until Milestone 3 is validated.

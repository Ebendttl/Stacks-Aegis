# Stacks Aegis: Live Demo Execution Script

**Target Duration:** 5 Minutes
**Format:** Screen Recording / Live Presentation for Endowment Committee

---

### **Minute 0:00–0:30 — The Problem**
*(Visual: Open local browser to the Stacks Aegis Mission Control dashboard displaying a live connection to the Stacks Testnet. Mouse cursor rests near the top-center readout.)*

**Speaker:**
"Most developers are building the exact same yield products fighting over the exact same fractional liquidity. I am stepping out of the casino to build the vault door. This is Stacks Aegis. What you see here is the live Testnet dashboard."

*(Visual: Highlight the Stability Score Gauge currently reading Nominal around 98%.)*

**Speaker:**
"This is what normal looks like. The Risk Oracle is actively reading the sBTC peg, your capital is earning yield in the ecosystem, and Aegis is constantly watching."

---

### **Minute 0:30–1:30 — The Deposit Flow**
*(Visual: Click the Web3 'Connect Wallet' button. Select a Testnet Leather/Xverse wallet. Navigate to the 'Vault Exposure' pane.)*

**Speaker:**
"Let's protect some capital."

*(Visual: Click 'Deposit' [or via terminal/ui sim], triggering the wallet popup to sign 0.001 sBTC inbound. Wait. Show the testnet block confirmation via Hiro Explorer link popup.)*

*(Visual: The UI polling hits the 10-second refresh and the Vault Exposure table updates, showing sBTC successfully located inside the Aegis Vault.)*

**Speaker:**
"One transaction. You are now protected. Aegis is mathematically wrapping your capital. Note the Frontend Post-Conditions explicitly guarantee this transfer mathematically before execution on-chain."

---

### **Minute 1:30–3:00 — The Money Shot**
*(Visual: Navigate to the top right of the dashboard and mouse over the bold 'SIMULATE PANIC' button. Click it. Slowly scroll down to the 'Real-time Incident Timeline'.)*

**Speaker:**
"Now, let's trigger a massive market volatility event. At 3 AM, while you sleep, a major integrated protocol faces a mass liquidation cascade, or the sBTC peg breaks violently."

*(Visual: The dashboard UI updates on the next poll cycle. The border turns red. The Emergency System Banner drops. The Stability Score crashes to ~50%. The Event Timeline populates instantly with `CIRCUIT BREAKER TRIPPED: All assets moved to safe vault.`)*

**Speaker:**
"Aegis just did this automatically. The Oracle accurately scored the volatility below the threshold threshold. The instant `evaluate-and-trigger` was called on-chain, the circuit breaker tripped, and all capital across the entire protocol was forcefully evacuated out of the active pools directly into the Safe Refuge vault."

---

### **Minute 3:00–4:00 — The Recovery**
*(Visual: Scroll to the Vault Exposure table. Show that the Aegis Vault balance is 0, and the Safe Vault balance perfectly reflects the initial 0.001 sBTC deposit.)*

**Speaker:**
"Here is the result. Notice the location. We are currently inside a catastrophic market cascade. But look at the Safe Vault."

*(Visual: Click the red 'Withdraw' button next to the Safe Vault entry. Sign the transaction in the wallet. Wait for the Hiro Explorer confirmation.)*

**Speaker:**
"Your principal is safe. It wasn't liquidated. It wasn't lost in a broken smart contract. Safe. We just directly withdrew our capital cleanly from the algorithmic refuge vault back to our primary Web3 wallet."

---

### **Minute 4:00–5:00 — The Vision**
*(Visual: Return the dashboard to Nominal operations via the 'RE-ENTER POOLS' reset. Quickly pan over to the 'Stacks Risk Radar' module showing various protocol health scores.)*

**Speaker:**
"This is the Bitcoin Safety Index. Every Stacks DeFi protocol, scored and monitored transparently. Stacks Aegis is more than just a vault; it's a public good. We are building the security layer that makes the next billion dollars of institutional Bitcoin possible on Stacks."

*(Visual: Open a new tab displaying the GitHub Repository containing the full test suite.)*

**Speaker:**
"The code is strictly tested, SIP-010 compliant, and ready for audit. Thank you."

*(Visual: End recording on a screen displaying the Testnet Explorer link highlighting all 5 E2E architectural transaction execution IDs, and the Stacks Endowment application portal URL.)*

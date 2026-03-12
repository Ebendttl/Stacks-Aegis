# Testnet Setup Guide

## Acquire Testnet STX
1. Go to https://explorer.hiro.so/sandbox/faucet?chain=testnet.
2. Connect the deployer wallet (import the testnet mnemonic into Leather or Xverse wallet).
3. Request STX from the faucet — note the expected wait time (1–2 minutes per confirmation).
4. Verify receipt: `curl https://stacks-node-api.testnet.stacks.co/v2/accounts/{YOUR_ADDRESS}` and confirm balance is non-zero.

## Acquire Testnet sBTC
1. Navigate to https://app.bitcoinfaucet.uo1.net/ for testnet BTC.
2. Use the sBTC testnet bridge at https://bridge.stacks.co (testnet mode) to convert tBTC → sBTC on Stacks testnet.
3. Steps: connect wallet → select "Deposit" → enter tBTC amount → confirm Bitcoin testnet transaction → wait for sBTC mint on Stacks testnet (typically 1–3 Bitcoin blocks, ~10–30 min).
4. Alternative fast path: use the Hiro Platform testnet sBTC faucet if available at https://platform.hiro.so.
5. Verify sBTC receipt by checking the SIP-010 token balance: `curl https://stacks-node-api.testnet.stacks.co/v2/accounts/{ADDRESS}/balances` and look for the sBTC contract entry.

## Fund Test Wallets
1. Fund all three test wallets (`wallet-1`, `wallet-2`, `wallet-3`) with at least 0.01 sBTC each for deposit testing. 
2. You can send sBTC between testnet wallets using the Hiro Explorer sandbox (Token Transfer option) or directly through Leather/Xverse wallet interface.

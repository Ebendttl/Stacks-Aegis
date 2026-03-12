#!/bin/bash
set -e

# Preflight Checks

# 1. Check Clarinet installation
if ! command -v clarinet &> /dev/null; then
  echo "ERROR: Clarinet is not installed. Please install it first."
  exit 1
fi

# 2. Check mnemonic
if [ -z "$STACKS_DEPLOYER_MNEMONIC" ]; then
  echo "ERROR: STACKS_DEPLOYER_MNEMONIC is not set. Run: export STACKS_DEPLOYER_MNEMONIC='your mnemonic here'"
  exit 1
fi

# 3. Check Node version 18+
NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node version 18+ is required. Found: $(node --version)"
  exit 1
fi

# 4. Check all four contract files exist at their expected paths
CONTRACTS=("aegis-traits.clar" "risk-oracle.clar" "safe-vault.clar" "aegis-vault.clar")
for contract in "${CONTRACTS[@]}"; do
  if [ ! -f "contracts/$contract" ]; then
    echo "ERROR: contracts/$contract does not exist."
    exit 1
  fi
done

# This is non-negotiable. Never deploy without passing tests.
echo "Running full test suite before deployment..."
npm test
if [ $? -ne 0 ]; then
  echo "ERROR: Tests failed. Deployment aborted. Fix all test failures before deploying to testnet."
  exit 1
fi

echo "Starting Deployment to Testnet..."

# Execute the deployment plan strictly based on Clarinet.toml order
clarinet deployments apply --testnet --manifest-path Clarinet.toml

echo "Deployment submitted. Verifying contract interfaces on testnet..."
echo "NOTE: Replace {DEPLOYER_ADDRESS} with your actual deployer address."

DEPLOYER="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"

# Verify aegis-traits
echo "Verifying aegis-traits..."
if curl -s -f "https://api.testnet.hiro.so/v2/contracts/interface/$DEPLOYER.aegis-traits" > /dev/null; then
  echo "SUCCESS: aegis-traits interface verified."
else
  echo "FAILURE or PENDING: aegis-traits not yet reporting interface."
fi

# Verify risk-oracle
echo "Verifying risk-oracle..."
if curl -s -f "https://api.testnet.hiro.so/v2/contracts/interface/$DEPLOYER.risk-oracle" > /dev/null; then
  echo "SUCCESS: risk-oracle interface verified."
else
  echo "FAILURE or PENDING: risk-oracle not yet reporting interface."
fi

# Verify safe-vault
echo "Verifying safe-vault..."
if curl -s -f "https://api.testnet.hiro.so/v2/contracts/interface/$DEPLOYER.safe-vault" > /dev/null; then
  echo "SUCCESS: safe-vault interface verified."
else
  echo "FAILURE or PENDING: safe-vault not yet reporting interface."
fi

# Verify aegis-vault
echo "Verifying aegis-vault..."
if curl -s -f "https://api.testnet.hiro.so/v2/contracts/interface/$DEPLOYER.aegis-vault" > /dev/null; then
  echo "SUCCESS: aegis-vault interface verified."
else
  echo "FAILURE or PENDING: aegis-vault not yet reporting interface."
fi

echo "=================================="
echo "Deployment Process Complete."
echo "Deployed Contracts:"
echo "- $DEPLOYER.aegis-traits"
echo "- $DEPLOYER.risk-oracle"
echo "- $DEPLOYER.safe-vault"
echo "- $DEPLOYER.aegis-vault"
echo "Current Testnet Block Height: $(curl -s https://stacks-node-api.testnet.stacks.co/v2/info | grep -o '"stacks_tip_height":[0-9]*' | cut -d ':' -f 2)"
echo "Next step: Run scripts/seed-testnet.sh to fund test wallets and execute initial deposits."

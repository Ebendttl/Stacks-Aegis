#!/bin/bash
echo "STACKS AEGIS — PRE-SUBMISSION CHECKLIST"
echo "========================================"

# 1. All contracts compile without warnings
clarinet check >/dev/null 2>&1 && echo "✓ Contracts compile clean" || echo "✗ FAIL: Contract compilation errors"

# 2. Full test suite passes with >80% coverage
# 2. Full test suite passes with >80% coverage
clarinet test --coverage | grep "Coverage" | awk '{if ($2 >= 80) print "✓ Test coverage: "$2"%"; else print "✗ FAIL: Coverage "$2"% is below 80% threshold"}'

# 3. No unwrap-panic in any contract
if grep -r "unwrap-panic" contracts/; then
  echo "✗ FAIL: unwrap-panic found — replace with unwrap!"
else
  echo "✓ No unwrap-panic found"
fi

# 4. No hardcoded principals in contracts (no ST... addresses)
if grep -re "ST1\|ST2\|ST3" contracts/; then
  echo "✗ FAIL: Hardcoded principal found in contracts"
else
  echo "✓ No hardcoded principals"
fi

# 5. .env files are gitignored
if grep -q "\.env\.testnet" dashboard/.gitignore 2>/dev/null; then
  echo "✓ .env.testnet is gitignored"
else
  echo "✗ FAIL: .env.testnet not in dashboard/.gitignore — SECURITY RISK"
fi

# 6. All four grant submission files exist
for f in TECHNICAL_SUMMARY.md SECURITY_MODEL.md DEMO_SCRIPT.md METRICS_BASELINE.md; do
  if [ -f "grant-submission/$f" ]; then
    echo "✓ grant-submission/$f exists"
  else
    echo "✗ FAIL: grant-submission/$f missing"
  fi
done

# 7. README has testnet contract addresses
if grep -q "testnet.stacks.co" README.md || grep -q "explorer.hiro.so/txid" README.md; then
  echo "✓ README contains testnet links"
else
  echo "✗ FAIL: README missing testnet links"
fi

# 8. e2e verification script is executable
if [ -x "scripts/e2e-verification.sh" ]; then
  echo "✓ e2e-verification.sh is executable"
else
  echo "✗ FAIL: chmod +x scripts/e2e-verification.sh"
fi

echo "========================================"
echo "Run complete. Fix all ✗ items before submission."

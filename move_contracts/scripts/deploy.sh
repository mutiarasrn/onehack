#!/usr/bin/env bash
# Deploy OneChain Fantasy contracts to testnet
# Prerequisites: `one` CLI installed and configured with testnet

set -e

PACKAGE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== OneChain Fantasy — Deploy to Testnet ==="
echo ""

# Check one CLI
if ! command -v one &> /dev/null; then
  echo "ERROR: 'one' CLI not found."
  echo "Install: cargo install --locked --git https://github.com/one-chain-labs/onechain.git one --features tracing"
  exit 1
fi

# Switch to testnet
one client switch --env testnet 2>/dev/null || true

# Request test tokens from faucet
echo "Requesting testnet OCT from faucet..."
ADDRESS=$(one client active-address)
curl -s -X POST https://faucet-testnet.onelabs.cc/v1/gas \
  -H "Content-Type: application/json" \
  -d "{\"FixedAmountRequest\":{\"recipient\":\"$ADDRESS\"}}" | jq .
echo ""

# Build
echo "Building Move package..."
cd "$PACKAGE_DIR"
one move build

# Publish
echo "Publishing to testnet..."
RESULT=$(one client publish --gas-budget 5000000 --json)
echo "$RESULT" > "$PACKAGE_DIR/scripts/deploy-result.json"

# Extract package ID
PACKAGE_ID=$(echo "$RESULT" | jq -r '.objectChanges[] | select(.type == "published") | .packageId')
echo ""
echo "✓ Package published: $PACKAGE_ID"

# Write addresses for frontend
cat > "$PACKAGE_DIR/../frontend/lib/contract-addresses.json" <<JSON
{
  "packageId": "$PACKAGE_ID",
  "network": "testnet",
  "rpc": "https://rpc-testnet.onelabs.cc:443"
}
JSON

echo "✓ Addresses written to frontend/lib/contract-addresses.json"
echo ""
echo "Next: run 'npm run seed' in move_contracts/scripts/ to mint athlete NFTs"

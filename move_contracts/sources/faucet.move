/// Faucet — not used. OCT is claimed directly from the OneChain testnet faucet.
/// https://faucet-testnet.onelabs.cc/v1/gas
///
/// This module is kept as a placeholder. To get testnet OCT:
///   curl -X POST https://faucet-testnet.onelabs.cc/v1/gas \
///     -H "Content-Type: application/json" \
///     -d '{"FixedAmountRequest":{"recipient":"<YOUR_ADDRESS>"}}'
/// Or via CLI:
///   one client faucet
module onehack_fantasy::faucet {}

/// FANTASY — custom in-game currency for OneChain Fantasy Sports.
/// TreasuryCap is shared so the faucet module can mint tokens for users.
module onehack_fantasy::game_token {
    use one::coin;
    use one::transfer;
    use one::tx_context::TxContext;
    use std::option;

    /// One-time witness — must match module name in ALL CAPS.
    public struct FANTASY has drop {}

    fun init(witness: FANTASY, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9,                              // decimals (same scale as OCT/SUI)
            b"FANTASY",                     // symbol
            b"Fantasy Sports Token",        // name
            b"In-game currency for OneChain Fantasy Sports",
            option::none(),
            ctx,
        );

        // Share TreasuryCap so the faucet entry fun can call coin::mint
        transfer::public_share_object(treasury);
        // Freeze metadata — no further changes needed
        transfer::public_freeze_object(metadata);
    }
}

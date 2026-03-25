/// Faucet — testnet only. Drips FANTASY tokens to new users for demo/testing.
module onehack_fantasy::faucet {
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::coin::{Self, TreasuryCap};
    use onehack_fantasy::game_token::FANTASY;
    use one::table::{Self, Table};

    // ─── Constants ─────────────────────────────────────────────────────────────

    const DRIP_AMOUNT: u64    = 100_000_000_000; // 100 OCT in MIST
    const COOLDOWN_EPOCHS: u64 = 1;              // once per epoch

    const E_COOLDOWN: u64 = 1;

    // ─── Objects ───────────────────────────────────────────────────────────────

    public struct Faucet has key {
        id: UID,
        last_drip: Table<address, u64>, // address → last epoch claimed
    }

    // ─── Init ──────────────────────────────────────────────────────────────────

    fun init(ctx: &mut TxContext) {
        transfer::share_object(Faucet {
            id: object::new(ctx),
            last_drip: table::new(ctx),
        });
    }

    // ─── Drip ──────────────────────────────────────────────────────────────────

    /// Mint FANTASY tokens to the caller. TreasuryCap is shared on testnet for hackathon demo.
    public entry fun drip(
        faucet: &mut Faucet,
        treasury: &mut TreasuryCap<FANTASY>,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let epoch = tx_context::epoch(ctx);

        if (table::contains(&faucet.last_drip, sender)) {
            let last = *table::borrow(&faucet.last_drip, sender);
            assert!(epoch >= last + COOLDOWN_EPOCHS, E_COOLDOWN);
            *table::borrow_mut(&mut faucet.last_drip, sender) = epoch;
        } else {
            table::add(&mut faucet.last_drip, sender, epoch);
        };

        let coins = coin::mint(treasury, DRIP_AMOUNT, ctx);
        transfer::public_transfer(coins, sender);
    }
}

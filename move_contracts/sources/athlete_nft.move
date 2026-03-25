/// AthleteNFT — each athlete card is a unique on-chain object.
/// Rarity: 0=Bronze, 1=Silver, 2=Gold, 3=Legendary
module onehack_fantasy::athlete_nft {
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::event;
    use std::string::{Self, String};

    // ─── Object ────────────────────────────────────────────────────────────────

    public struct AthleteNFT has key, store {
        id: UID,
        token_id: u64,
        name: String,
        sport: String,
        position: String,
        image_uri: String,
        rarity: u8,       // 0-3
        base_score: u64,  // base fantasy points (scaled x100 for two decimals)
    }

    // ─── Admin cap ─────────────────────────────────────────────────────────────

    /// Held by the deployer; needed to mint athletes.
    public struct MinterCap has key, store {
        id: UID,
    }

    // ─── Events ────────────────────────────────────────────────────────────────

    public struct AthleteMinted has copy, drop {
        token_id: u64,
        name: String,
        sport: String,
        position: String,
        rarity: u8,
        recipient: address,
    }

    // ─── Counter (shared) ──────────────────────────────────────────────────────

    public struct TokenCounter has key {
        id: UID,
        next_id: u64,
    }

    // ─── Init ──────────────────────────────────────────────────────────────────

    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);

        transfer::transfer(
            MinterCap { id: object::new(ctx) },
            sender,
        );

        transfer::share_object(TokenCounter {
            id: object::new(ctx),
            next_id: 1,
        });
    }

    // ─── Mint ──────────────────────────────────────────────────────────────────

    public entry fun mint(
        _cap: &MinterCap,
        counter: &mut TokenCounter,
        name: vector<u8>,
        sport: vector<u8>,
        position: vector<u8>,
        image_uri: vector<u8>,
        rarity: u8,
        base_score: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        assert!(rarity <= 3, 0);

        let token_id = counter.next_id;
        counter.next_id = counter.next_id + 1;

        let nft = AthleteNFT {
            id: object::new(ctx),
            token_id,
            name: string::utf8(name),
            sport: string::utf8(sport),
            position: string::utf8(position),
            image_uri: string::utf8(image_uri),
            rarity,
            base_score,
        };

        event::emit(AthleteMinted {
            token_id,
            name: nft.name,
            sport: nft.sport,
            position: nft.position,
            rarity,
            recipient,
        });

        transfer::transfer(nft, recipient);
    }

    // ─── Read helpers ──────────────────────────────────────────────────────────

    public fun token_id(nft: &AthleteNFT): u64 { nft.token_id }
    public fun name(nft: &AthleteNFT): &String { &nft.name }
    public fun sport(nft: &AthleteNFT): &String { &nft.sport }
    public fun position(nft: &AthleteNFT): &String { &nft.position }
    public fun rarity(nft: &AthleteNFT): u8 { nft.rarity }
    public fun base_score(nft: &AthleteNFT): u64 { nft.base_score }
}

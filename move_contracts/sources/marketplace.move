/// Marketplace — peer-to-peer AthleteNFT listings.
/// Seller calls list() to create a shared Listing object.
/// Buyer calls buy() to pay and receive the NFT.
/// Seller can call delist() to cancel before a sale.
module onehack_fantasy::marketplace {
    use one::object::{Self, UID, ID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::event;
    use one::coin::{Self, Coin};
    use one::oct::OCT;
    use onehack_fantasy::athlete_nft::AthleteNFT;

    // ─── Errors ────────────────────────────────────────────────────────────────

    const E_WRONG_PAYMENT: u64 = 1;
    const E_NOT_SELLER: u64    = 2;

    // ─── Objects ───────────────────────────────────────────────────────────────

    /// Shared object created for each listing.
    public struct Listing has key {
        id: UID,
        seller: address,
        price_mist: u64,    // OCT price in MIST (1 OCT = 1_000_000_000 MIST)
        nft: AthleteNFT,
    }

    // ─── Events ────────────────────────────────────────────────────────────────

    public struct Listed has copy, drop {
        listing_id: ID,
        seller: address,
        price_mist: u64,
    }

    public struct Sold has copy, drop {
        listing_id: ID,
        seller: address,
        buyer: address,
        price_mist: u64,
    }

    public struct Delisted has copy, drop {
        listing_id: ID,
        seller: address,
    }

    // ─── Entry functions ───────────────────────────────────────────────────────

    /// Put an AthleteNFT up for sale at a fixed OCT price.
    public entry fun list(
        nft: AthleteNFT,
        price_mist: u64,
        ctx: &mut TxContext,
    ) {
        let seller = tx_context::sender(ctx);
        let listing = Listing {
            id: object::new(ctx),
            seller,
            price_mist,
            nft,
        };

        event::emit(Listed {
            listing_id: object::id(&listing),
            seller,
            price_mist,
        });

        transfer::share_object(listing);
    }

    /// Buy a listed AthleteNFT by paying the exact price in OCT.
    public entry fun buy(
        listing: Listing,
        payment: Coin<OCT>,
        ctx: &mut TxContext,
    ) {
        let buyer = tx_context::sender(ctx);

        assert!(coin::value(&payment) == listing.price_mist, E_WRONG_PAYMENT);

        let Listing { id, seller, price_mist, nft } = listing;
        let listing_id = object::uid_to_inner(&id);
        object::delete(id);

        // Send OCT to seller
        transfer::public_transfer(payment, seller);

        // Send NFT to buyer
        transfer::public_transfer(nft, buyer);

        event::emit(Sold {
            listing_id,
            seller,
            buyer,
            price_mist,
        });
    }

    /// Cancel a listing and return the NFT to the seller.
    public entry fun delist(
        listing: Listing,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == listing.seller, E_NOT_SELLER);

        let Listing { id, seller, price_mist: _, nft } = listing;
        let listing_id = object::uid_to_inner(&id);
        object::delete(id);

        transfer::public_transfer(nft, seller);

        event::emit(Delisted {
            listing_id,
            seller,
        });
    }

    // ─── Read helpers ──────────────────────────────────────────────────────────

    public fun price_mist(listing: &Listing): u64 { listing.price_mist }
    public fun seller(listing: &Listing): address { listing.seller }
}

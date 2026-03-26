/// LeagueManager — create and manage fantasy leagues (contests).
/// Entry fee is paid in OCT (native token). Prize pool accumulates here.
module onehack_fantasy::league_manager {
    use one::object::{Self, UID, ID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::event;
    use one::coin::{Self, Coin};
    use one::oct::OCT;
    use one::balance::{Self, Balance};
    use one::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::vector;

    // ─── Constants ─────────────────────────────────────────────────────────────

    const E_LEAGUE_FULL: u64          = 1;
    const E_ALREADY_JOINED: u64       = 2;
    const E_WRONG_FEE: u64            = 3;
    const E_LEAGUE_NOT_OPEN: u64      = 4;
    const E_NOT_AUTHORIZED: u64       = 5;

    // Status values
    const STATUS_OPEN: u8     = 0;
    const STATUS_ACTIVE: u8   = 1;
    const STATUS_FINISHED: u8 = 2;

    // ─── Objects ───────────────────────────────────────────────────────────────

    public struct AdminCap has key, store { id: UID }

    /// Shared league object — one per contest.
    public struct League has key {
        id: UID,
        name: String,
        sport: String,
        entry_fee: u64,           // OCT, in MIST (1 OCT = 1_000_000_000 MIST)
        max_entrants: u64,
        start_time_ms: u64,       // unix ms
        end_time_ms: u64,
        status: u8,
        entrants: vector<address>,
        prize_pool: Balance<OCT>,
        prize_splits: vector<u64>, // percentages, sum = 100
        winners: vector<address>,  // filled after resolution
    }

    // ─── Events ────────────────────────────────────────────────────────────────

    public struct LeagueCreated has copy, drop {
        league_id: ID,
        name: String,
        sport: String,
        entry_fee: u64,
        max_entrants: u64,
    }

    public struct PlayerJoined has copy, drop {
        league_id: ID,
        player: address,
        total_entrants: u64,
    }

    public struct LeagueResolved has copy, drop {
        league_id: ID,
        winners: vector<address>,
    }

    // ─── Init ──────────────────────────────────────────────────────────────────

    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            AdminCap { id: object::new(ctx) },
            tx_context::sender(ctx),
        );
    }

    // ─── Create league ─────────────────────────────────────────────────────────

    public entry fun create_league(
        _cap: &AdminCap,
        name: vector<u8>,
        sport: vector<u8>,
        entry_fee: u64,
        max_entrants: u64,
        start_time_ms: u64,
        duration_ms: u64,
        prize_splits: vector<u64>,
        ctx: &mut TxContext,
    ) {
        let league = League {
            id: object::new(ctx),
            name: string::utf8(name),
            sport: string::utf8(sport),
            entry_fee,
            max_entrants,
            start_time_ms,
            end_time_ms: start_time_ms + duration_ms,
            status: STATUS_OPEN,
            entrants: vector::empty(),
            prize_pool: balance::zero(),
            prize_splits,
            winners: vector::empty(),
        };

        event::emit(LeagueCreated {
            league_id: object::id(&league),
            name: league.name,
            sport: league.sport,
            entry_fee,
            max_entrants,
        });

        transfer::share_object(league);
    }

    // ─── Join league ───────────────────────────────────────────────────────────

    public entry fun join_league(
        league: &mut League,
        payment: Coin<OCT>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock);

        assert!(league.status == STATUS_OPEN, E_LEAGUE_NOT_OPEN);
        assert!(now < league.start_time_ms, E_LEAGUE_NOT_OPEN);
        assert!(vector::length(&league.entrants) < league.max_entrants, E_LEAGUE_FULL);
        assert!(!vector::contains(&league.entrants, &sender), E_ALREADY_JOINED);
        assert!(coin::value(&payment) == league.entry_fee, E_WRONG_FEE);

        balance::join(&mut league.prize_pool, coin::into_balance(payment));
        vector::push_back(&mut league.entrants, sender);

        event::emit(PlayerJoined {
            league_id: object::id(league),
            player: sender,
            total_entrants: vector::length(&league.entrants),
        });
    }

    // Free entry (entry_fee == 0)
    public entry fun join_league_free(
        league: &mut League,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock);

        assert!(league.status == STATUS_OPEN, E_LEAGUE_NOT_OPEN);
        assert!(now < league.start_time_ms, E_LEAGUE_NOT_OPEN);
        assert!(league.entry_fee == 0, E_WRONG_FEE);
        assert!(vector::length(&league.entrants) < league.max_entrants, E_LEAGUE_FULL);
        assert!(!vector::contains(&league.entrants, &sender), E_ALREADY_JOINED);

        vector::push_back(&mut league.entrants, sender);

        event::emit(PlayerJoined {
            league_id: object::id(league),
            player: sender,
            total_entrants: vector::length(&league.entrants),
        });
    }

    // ─── Resolve & distribute prizes ───────────────────────────────────────────

    /// Called by admin after scoring is final.
    /// `ranked_players` = sorted entrant addresses, best score first.
    public entry fun resolve_league(
        _cap: &AdminCap,
        league: &mut League,
        ranked_players: vector<address>,
        ctx: &mut TxContext,
    ) {
        assert!(league.status != STATUS_FINISHED, E_NOT_AUTHORIZED);

        league.status = STATUS_FINISHED;
        league.winners = ranked_players;

        let total = balance::value(&league.prize_pool);
        let num_splits = vector::length(&league.prize_splits);
        let mut i = 0;

        while (i < num_splits && i < vector::length(&ranked_players)) {
            let pct = *vector::borrow(&league.prize_splits, i);
            if (pct == 0) break;

            let prize_amount = total * pct / 100;
            if (prize_amount > 0 && balance::value(&league.prize_pool) >= prize_amount) {
                let winner = *vector::borrow(&ranked_players, i);
                let payout = coin::from_balance(
                    balance::split(&mut league.prize_pool, prize_amount),
                    ctx,
                );
                transfer::public_transfer(payout, winner);
            };
            i = i + 1;
        };

        event::emit(LeagueResolved {
            league_id: object::id(league),
            winners: league.winners,
        });
    }

    // ─── Read helpers ──────────────────────────────────────────────────────────

    public fun entry_fee(league: &League): u64 { league.entry_fee }
    public fun entrant_count(league: &League): u64 { vector::length(&league.entrants) }
    public fun status(league: &League): u8 { league.status }
    public fun is_entrant(league: &League, addr: address): bool {
        vector::contains(&league.entrants, &addr)
    }
}

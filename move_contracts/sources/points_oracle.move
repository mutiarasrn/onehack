/// PointsOracle — trusted oracle pushes live fantasy scores on-chain.
/// The mock-oracle service calls `update_scores` every 30 s during a contest.
module onehack_fantasy::points_oracle {
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::event;
    use one::table::{Self, Table};

    // ─── Objects ───────────────────────────────────────────────────────────────

    /// Shared — anyone can read scores, only OracleCap holder can write.
    public struct ScoreBoard has key {
        id: UID,
        /// token_id → cumulative fantasy points (u64, scaled x100)
        scores: Table<u64, u64>,
        contest_id: u64,
        updated_at_epoch: u64,
    }

    /// Held by the oracle operator (mock-oracle service wallet).
    public struct OracleCap has key, store {
        id: UID,
    }

    // ─── Events ────────────────────────────────────────────────────────────────

    public struct ScoresUpdated has copy, drop {
        contest_id: u64,
        num_athletes: u64,
        epoch: u64,
    }

    // ─── Init ──────────────────────────────────────────────────────────────────

    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);

        transfer::transfer(
            OracleCap { id: object::new(ctx) },
            sender,
        );

        transfer::share_object(ScoreBoard {
            id: object::new(ctx),
            scores: table::new(ctx),
            contest_id: 1,
            updated_at_epoch: 0,
        });
    }

    // ─── Oracle write ──────────────────────────────────────────────────────────

    /// Push a batch of scores. `athlete_ids` and `points` must be same length.
    public entry fun update_scores(
        _cap: &OracleCap,
        board: &mut ScoreBoard,
        contest_id: u64,
        athlete_ids: vector<u64>,
        points: vector<u64>,
        ctx: &mut TxContext,
    ) {
        let len = vector::length(&athlete_ids);
        assert!(len == vector::length(&points), 0);

        board.contest_id = contest_id;
        board.updated_at_epoch = tx_context::epoch(ctx);

        let mut i = 0;
        while (i < len) {
            let id = *vector::borrow(&athlete_ids, i);
            let pts = *vector::borrow(&points, i);

            if (table::contains(&board.scores, id)) {
                *table::borrow_mut(&mut board.scores, id) = pts;
            } else {
                table::add(&mut board.scores, id, pts);
            };
            i = i + 1;
        };

        event::emit(ScoresUpdated {
            contest_id,
            num_athletes: len,
            epoch: board.updated_at_epoch,
        });
    }

    // ─── Read helpers ──────────────────────────────────────────────────────────

    public fun get_score(board: &ScoreBoard, token_id: u64): u64 {
        if (table::contains(&board.scores, token_id)) {
            *table::borrow(&board.scores, token_id)
        } else {
            0
        }
    }

    public fun contest_id(board: &ScoreBoard): u64 { board.contest_id }
    public fun updated_at_epoch(board: &ScoreBoard): u64 { board.updated_at_epoch }
}

/// FantasyTeam — a player's roster submission for a specific league.
/// Each team holds references (token_ids) to AthleteNFTs the player owns.
module onehack_fantasy::fantasy_team {
    use one::object::{Self, UID, ID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::event;
    use std::vector;

    // ─── Constants ─────────────────────────────────────────────────────────────

    const E_WRONG_ROSTER_SIZE: u64 = 1;
    const E_DUPLICATE_ATHLETE: u64 = 2;
    const MAX_ROSTER: u64          = 5;

    // ─── Objects ───────────────────────────────────────────────────────────────

    /// Owned by the submitting player.
    public struct FantasyTeam has key, store {
        id: UID,
        league_id: ID,
        owner: address,
        athlete_token_ids: vector<u64>,  // 5 slots
        total_score: u64,                // updated by oracle resolver
        rank: u64,                       // set after league finishes
    }

    // ─── Events ────────────────────────────────────────────────────────────────

    public struct TeamSubmitted has copy, drop {
        team_id: ID,
        league_id: ID,
        owner: address,
        athlete_token_ids: vector<u64>,
    }

    public struct TeamScoreUpdated has copy, drop {
        team_id: ID,
        total_score: u64,
    }

    // ─── Submit team ───────────────────────────────────────────────────────────

    public entry fun submit_team(
        league_id: ID,
        athlete_token_ids: vector<u64>,
        ctx: &mut TxContext,
    ) {
        let owner = tx_context::sender(ctx);
        let len = vector::length(&athlete_token_ids);

        assert!(len == MAX_ROSTER, E_WRONG_ROSTER_SIZE);

        // Check no duplicates
        let mut i = 0;
        while (i < len) {
            let id_i = *vector::borrow(&athlete_token_ids, i);
            let mut j = i + 1;
            while (j < len) {
                assert!(*vector::borrow(&athlete_token_ids, j) != id_i, E_DUPLICATE_ATHLETE);
                j = j + 1;
            };
            i = i + 1;
        };

        let team = FantasyTeam {
            id: object::new(ctx),
            league_id,
            owner,
            athlete_token_ids,
            total_score: 0,
            rank: 0,
        };

        event::emit(TeamSubmitted {
            team_id: object::id(&team),
            league_id,
            owner,
            athlete_token_ids: team.athlete_token_ids,
        });

        transfer::transfer(team, owner);
    }

    // ─── Score update (called by resolver / admin) ─────────────────────────────

    public entry fun update_score(
        team: &mut FantasyTeam,
        new_score: u64,
    ) {
        team.total_score = new_score;

        event::emit(TeamScoreUpdated {
            team_id: object::id(team),
            total_score: new_score,
        });
    }

    // ─── Read helpers ──────────────────────────────────────────────────────────

    public fun league_id(team: &FantasyTeam): ID { team.league_id }
    public fun owner(team: &FantasyTeam): address { team.owner }
    public fun athlete_token_ids(team: &FantasyTeam): &vector<u64> { &team.athlete_token_ids }
    public fun total_score(team: &FantasyTeam): u64 { team.total_score }
    public fun rank(team: &FantasyTeam): u64 { team.rank }
}

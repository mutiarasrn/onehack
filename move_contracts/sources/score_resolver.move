/// ScoreResolver — computes each team's total fantasy score from oracle data
/// and emits ranked results for the LeagueManager to distribute prizes.
///
/// Flow:
///   1. Oracle pushes scores → PointsOracle.ScoreBoard (shared)
///   2. Admin calls `compute_team_score` for every FantasyTeam in the league
///   3. Admin calls `LeagueManager::resolve_league` with ranked addresses
module onehack_fantasy::score_resolver {
    use onehack_fantasy::points_oracle::{ScoreBoard, get_score};
    use onehack_fantasy::fantasy_team::{Self, FantasyTeam};
    use one::tx_context::{TxContext};
    use one::event;
    use std::vector;

    // ─── Events ────────────────────────────────────────────────────────────────

    public struct TeamScoreComputed has copy, drop {
        owner: address,
        total_score: u64,
    }

    // ─── Compute ───────────────────────────────────────────────────────────────

    /// Read oracle scores for each athlete in the team and sum them up.
    /// Rarity multiplier: Bronze=1x, Silver=1.2x, Gold=1.5x, Legendary=2x
    /// Multipliers are applied off-chain for simplicity; on-chain we store
    /// base points. Pass `rarity_bonuses` as bonus pct per slot (0 = no bonus).
    public entry fun compute_team_score(
        team: &mut FantasyTeam,
        board: &ScoreBoard,
        rarity_bonuses: vector<u64>,  // e.g. [0, 50, 20, 0, 100] → +0%, +50%, +20%, +0%, +100%
        _ctx: &mut TxContext,
    ) {
        let ids = fantasy_team::athlete_token_ids(team);
        let len = vector::length(ids);
        let mut total: u64 = 0;
        let mut i = 0;

        while (i < len) {
            let token_id = *vector::borrow(ids, i);
            let base_pts = get_score(board, token_id);

            let bonus_pct = if (i < vector::length(&rarity_bonuses)) {
                *vector::borrow(&rarity_bonuses, i)
            } else {
                0
            };

            // score * (100 + bonus_pct) / 100
            let adjusted = base_pts * (100 + bonus_pct) / 100;
            total = total + adjusted;
            i = i + 1;
        };

        fantasy_team::update_score(team, total);

        event::emit(TeamScoreComputed {
            owner: fantasy_team::owner(team),
            total_score: total,
        });
    }
}

-- CrowdSignal Production Database Schema
-- SQLite schema for durable event indexing, snapshots, predictions, reputation, and provenance.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- 1. Markets
CREATE TABLE IF NOT EXISTS markets (
    market_id TEXT PRIMARY KEY,
    asset TEXT NOT NULL,
    symbol TEXT NOT NULL,
    interval_sec INTEGER NOT NULL,
    status TEXT NOT NULL,
    expiry INTEGER NOT NULL,
    pool_address TEXT,
    collateral_address TEXT,
    created_at_block INTEGER,
    created_at_timestamp INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 2. Market Snapshots (microstructure & observable state)
CREATE TABLE IF NOT EXISTS market_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id TEXT NOT NULL REFERENCES markets(market_id) ON DELETE CASCADE,
    timestamp INTEGER NOT NULL,
    block_number INTEGER,
    best_bid REAL,
    best_ask REAL,
    midpoint REAL,
    spread REAL,
    relative_spread REAL,
    bid_depth REAL,
    ask_depth REAL,
    trade_count INTEGER DEFAULT 0,
    trade_volume REAL DEFAULT 0,
    open_interest REAL, -- NULL if unobservable
    up_exposure REAL,
    down_exposure REAL,
    order_flow_imbalance REAL,
    queue_imbalance REAL,
    microprice REAL,
    price_implied_probability REAL,
    capital_skew REAL
);

-- 3. Orderbook Snapshots
CREATE TABLE IF NOT EXISTS orderbook_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    market_id TEXT NOT NULL REFERENCES markets(market_id) ON DELETE CASCADE,
    timestamp INTEGER NOT NULL,
    block_number INTEGER,
    bids_json TEXT NOT NULL,
    asks_json TEXT NOT NULL
);

-- 4. Trades (idempotent via tx_hash + log_index)
CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY, -- tx_hash:log_index
    market_id TEXT NOT NULL REFERENCES markets(market_id) ON DELETE CASCADE,
    tx_hash TEXT NOT NULL,
    log_index INTEGER NOT NULL,
    block_number INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    trader TEXT NOT NULL,
    direction TEXT NOT NULL CHECK(direction IN ('UP', 'DOWN')),
    price REAL NOT NULL,
    size REAL NOT NULL,
    collateral_amount REAL NOT NULL,
    is_maker INTEGER DEFAULT 0,
    UNIQUE(tx_hash, log_index)
);

-- 5. Fills
CREATE TABLE IF NOT EXISTS fills (
    id TEXT PRIMARY KEY, -- tx_hash:log_index
    market_id TEXT NOT NULL REFERENCES markets(market_id) ON DELETE CASCADE,
    tx_hash TEXT NOT NULL,
    log_index INTEGER NOT NULL,
    order_id TEXT,
    maker TEXT NOT NULL,
    taker TEXT NOT NULL,
    price REAL NOT NULL,
    amount REAL NOT NULL,
    timestamp INTEGER NOT NULL,
    UNIQUE(tx_hash, log_index)
);

-- 6. Settlements
CREATE TABLE IF NOT EXISTS settlements (
    market_id TEXT PRIMARY KEY REFERENCES markets(market_id) ON DELETE CASCADE,
    tx_hash TEXT NOT NULL,
    block_number INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    winning_outcome INTEGER NOT NULL, -- 1 for UP, 0 for DOWN, -1 for VOID
    settlement_price REAL
);

-- 7. Participants
CREATE TABLE IF NOT EXISTS participants (
    address TEXT PRIMARY KEY,
    first_seen_timestamp INTEGER NOT NULL,
    last_seen_timestamp INTEGER NOT NULL,
    total_trades INTEGER DEFAULT 0,
    total_volume REAL DEFAULT 0
);

-- 8. Predictions (derived from real observable wallet trades)
CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    trader TEXT NOT NULL REFERENCES participants(address) ON DELETE CASCADE,
    market_id TEXT NOT NULL REFERENCES markets(market_id) ON DELETE CASCADE,
    timestamp INTEGER NOT NULL,
    block_number INTEGER,
    tx_hash TEXT NOT NULL,
    direction TEXT NOT NULL CHECK(direction IN ('UP', 'DOWN')),
    size REAL NOT NULL,
    confidence REAL, -- Derived from stake or price relative to midpoint
    market_probability_at_call REAL NOT NULL,
    outcome TEXT DEFAULT 'Pending' CHECK(outcome IN ('Correct', 'Incorrect', 'Pending', 'Voided')),
    brier_score REAL,
    brier_skill_score REAL,
    resolved_at INTEGER
);

-- 9. Reputation Scores (materialized rankings)
CREATE TABLE IF NOT EXISTS reputation_scores (
    trader TEXT PRIMARY KEY REFERENCES participants(address) ON DELETE CASCADE,
    ens_or_short TEXT,
    predictor_score INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    total_predictions INTEGER NOT NULL,
    resolved_predictions INTEGER NOT NULL,
    bayesian_accuracy_mean REAL NOT NULL,
    credible_interval_low REAL NOT NULL,
    credible_interval_high REAL NOT NULL,
    market_relative_skill REAL NOT NULL,
    mean_brier_score REAL NOT NULL,
    reliability REAL NOT NULL,
    resolution REAL NOT NULL,
    uncertainty REAL NOT NULL,
    recency_weighted_skill REAL NOT NULL,
    skill_trend TEXT NOT NULL CHECK(skill_trend IN ('IMPROVING', 'STABLE', 'DECLINING')),
    calibration_score INTEGER NOT NULL,
    consistency_score INTEGER NOT NULL,
    effective_sample_size REAL NOT NULL,
    is_verified INTEGER NOT NULL DEFAULT 0,
    rank INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- 10. Crowd Signals (historical quantitative records)
CREATE TABLE IF NOT EXISTS crowd_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    block_number INTEGER,
    latent_probability REAL NOT NULL,
    uncertainty_lower REAL NOT NULL,
    uncertainty_upper REAL NOT NULL,
    mid_probability REAL,
    micro_probability REAL,
    entropy REAL NOT NULL,
    information_velocity REAL NOT NULL,
    changepoint_probability REAL NOT NULL,
    market_regime TEXT NOT NULL,
    effective_participants REAL NOT NULL,
    concentration_hhi REAL NOT NULL,
    open_interest REAL, -- NULL if unobservable
    capital_skew REAL NOT NULL,
    provenance_hash TEXT NOT NULL,
    algorithm_version TEXT NOT NULL,
    input_snapshot_hash TEXT NOT NULL
);

-- 11. Divergence Observations
CREATE TABLE IF NOT EXISTS divergence_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    crowd_up_probability REAL NOT NULL,
    top_predictor_consensus REAL,
    divergence_percent REAL,
    effective_predictor_count REAL NOT NULL,
    persistence_score REAL NOT NULL,
    interpretation TEXT NOT NULL
);

-- 12. Provenance Records
CREATE TABLE IF NOT EXISTS provenance_records (
    signal_hash TEXT PRIMARY KEY,
    asset TEXT NOT NULL,
    algorithm_version TEXT NOT NULL,
    input_snapshot_hash TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    source_block INTEGER,
    source_timestamp INTEGER,
    payload_json TEXT NOT NULL
);

-- 13. Indexer Cursors (restart-safe incremental checkpointing)
CREATE TABLE IF NOT EXISTS indexer_cursors (
    cursor_key TEXT PRIMARY KEY,
    last_processed_block INTEGER NOT NULL,
    last_processed_timestamp INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_snapshots_market_ts ON market_snapshots(market_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trades_trader_ts ON trades(trader, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trades_market_block ON trades(market_id, block_number);
CREATE INDEX IF NOT EXISTS idx_predictions_trader_ts ON predictions(trader, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_market ON predictions(market_id);
CREATE INDEX IF NOT EXISTS idx_crowd_signals_asset_ts ON crowd_signals(asset, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_rank ON reputation_scores(rank ASC);
CREATE INDEX IF NOT EXISTS idx_reputation_verified ON reputation_scores(is_verified);

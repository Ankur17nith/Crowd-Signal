import path from "node:path";
import fs from "node:fs";

// Use dynamic require or import for node:sqlite in Next.js node runtime
let dbInstance: any = null;

export function getServerDb() {
  if (dbInstance) return dbInstance;

  try {
    // Look for data/crowdsignal.db in project root or current directory
    const candidates = [
      path.resolve(process.cwd(), "../data/crowdsignal.db"),
      path.resolve(process.cwd(), "data/crowdsignal.db"),
      path.resolve(process.cwd(), "../../data/crowdsignal.db"),
    ];

    let dbPath = candidates.find((p) => fs.existsSync(p));
    if (!dbPath) {
      // Create data directory if it doesn't exist yet
      const defaultDir = path.resolve(process.cwd(), "data");
      if (!fs.existsSync(defaultDir)) {
        try {
          fs.mkdirSync(defaultDir, { recursive: true });
        } catch {}
      }
      dbPath = path.join(defaultDir, "crowdsignal.db");
    }

    // @ts-ignore
    const { DatabaseSync } = require("node:sqlite");
    dbInstance = new DatabaseSync(dbPath, { readOnly: false });
    
    // Enable WAL mode
    dbInstance.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA synchronous = NORMAL;");
    
    // Ensure basic schema exists even if indexer hasn't run yet
    const schemaSql = `
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
      CREATE TABLE IF NOT EXISTS market_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        market_id TEXT NOT NULL,
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
        open_interest REAL,
        up_exposure REAL,
        down_exposure REAL,
        order_flow_imbalance REAL,
        queue_imbalance REAL,
        microprice REAL,
        price_implied_probability REAL,
        capital_skew REAL
      );
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
        open_interest REAL,
        capital_skew REAL NOT NULL,
        provenance_hash TEXT NOT NULL,
        algorithm_version TEXT NOT NULL,
        input_snapshot_hash TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS reputation_scores (
        trader TEXT PRIMARY KEY,
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
        skill_trend TEXT NOT NULL,
        calibration_score INTEGER NOT NULL,
        consistency_score INTEGER NOT NULL,
        effective_sample_size REAL NOT NULL,
        is_verified INTEGER NOT NULL DEFAULT 0,
        rank INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
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
      CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        trader TEXT NOT NULL,
        market_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        block_number INTEGER,
        tx_hash TEXT NOT NULL,
        direction TEXT NOT NULL,
        size REAL NOT NULL,
        confidence REAL,
        market_probability_at_call REAL NOT NULL,
        outcome TEXT DEFAULT 'Pending',
        brier_score REAL,
        brier_skill_score REAL,
        resolved_at INTEGER
      );
    `;
    dbInstance.exec(schemaSql);
  } catch (e) {
    console.error("[getServerDb] Could not initialize SQLite database:", e);
    dbInstance = null;
  }

  return dbInstance;
}

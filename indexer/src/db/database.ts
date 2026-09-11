import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Dynamic import or require for node:sqlite to ensure compatibility across modules
// @ts-ignore
import { DatabaseSync } from "node:sqlite";

export interface DBMarket {
  market_id: string;
  asset: string;
  symbol: string;
  interval_sec: number;
  status: string;
  expiry: number;
  pool_address: string | null;
  collateral_address: string | null;
  created_at_block: number | null;
  created_at_timestamp: number;
  updated_at: number;
}

export interface DBTrade {
  id: string;
  market_id: string;
  tx_hash: string;
  log_index: number;
  block_number: number;
  timestamp: number;
  trader: string;
  direction: "UP" | "DOWN";
  price: number;
  size: number;
  collateral_amount: number;
  is_maker: number;
}

export interface DBPrediction {
  id: string;
  trader: string;
  market_id: string;
  timestamp: number;
  block_number: number | null;
  tx_hash: string;
  direction: "UP" | "DOWN";
  size: number;
  confidence: number | null;
  market_probability_at_call: number;
  outcome?: "Correct" | "Incorrect" | "Pending" | "Voided";
  brier_score?: number | null;
  brier_skill_score?: number | null;
  resolved_at?: number | null;
}

export interface DBReputationScore {
  trader: string;
  ens_or_short: string;
  predictor_score: number;
  accuracy: number;
  total_predictions: number;
  resolved_predictions: number;
  bayesian_accuracy_mean: number;
  credible_interval_low: number;
  credible_interval_high: number;
  market_relative_skill: number;
  mean_brier_score: number;
  reliability: number;
  resolution: number;
  uncertainty: number;
  recency_weighted_skill: number;
  skill_trend: "IMPROVING" | "STABLE" | "DECLINING";
  calibration_score: number;
  consistency_score: number;
  effective_sample_size: number;
  is_verified: number;
  rank: number;
  updated_at: number;
}

export interface DBCrowdSignal {
  asset: string;
  timestamp: number;
  block_number: number | null;
  latent_probability: number;
  uncertainty_lower: number;
  uncertainty_upper: number;
  mid_probability: number | null;
  micro_probability: number | null;
  entropy: number;
  information_velocity: number;
  changepoint_probability: number;
  market_regime: string;
  effective_participants: number;
  concentration_hhi: number;
  open_interest: number | null;
  capital_skew: number;
  provenance_hash: string;
  algorithm_version: string;
  input_snapshot_hash: string;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: any;
  private dbPath: string;

  private stmtUpsertMarket: any;
  private stmtInsertSnapshot: any;
  private stmtInsertTrade: any;
  private stmtUpsertParticipant: any;
  private stmtInsertPrediction: any;
  private stmtUpsertReputation: any;
  private stmtInsertSignal: any;
  private stmtInsertDivergence: any;
  private stmtInsertProvenance: any;
  private stmtGetCursor: any;
  private stmtSetCursor: any;

  private constructor(customPath?: string) {
    const defaultDataDir = path.resolve(process.cwd(), "data");
    if (!fs.existsSync(defaultDataDir)) {
      try {
        fs.mkdirSync(defaultDataDir, { recursive: true });
      } catch {
        // Directory might already exist
      }
    }

    this.dbPath = customPath || process.env.DATABASE_PATH || path.join(defaultDataDir, "crowdsignal.db");
    this.db = new DatabaseSync(this.dbPath);

    this.initSchema();
    this.prepareStatements();
  }

  public static getInstance(customPath?: string): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(customPath);
    }
    return DatabaseManager.instance;
  }

  public static resetInstanceForTesting(customPath?: string): DatabaseManager {
    if (DatabaseManager.instance) {
      try {
        DatabaseManager.instance.db.close();
      } catch {}
      // @ts-ignore
      DatabaseManager.instance = null;
    }
    DatabaseManager.instance = new DatabaseManager(customPath);
    return DatabaseManager.instance;
  }

  private initSchema() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const schemaPath = path.join(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf-8");
      this.db.exec(sql);
    } else {
      // Fallback relative to project root
      const rootSchemaPath = path.resolve(process.cwd(), "src/db/schema.sql");
      if (fs.existsSync(rootSchemaPath)) {
        const sql = fs.readFileSync(rootSchemaPath, "utf-8");
        this.db.exec(sql);
      }
    }
  }

  private prepareStatements() {
    this.stmtUpsertMarket = this.db.prepare(`
      INSERT INTO markets (market_id, asset, symbol, interval_sec, status, expiry, pool_address, collateral_address, created_at_block, created_at_timestamp, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(market_id) DO UPDATE SET
        status = excluded.status,
        expiry = excluded.expiry,
        updated_at = excluded.updated_at
    `);

    this.stmtInsertSnapshot = this.db.prepare(`
      INSERT INTO market_snapshots (
        market_id, timestamp, block_number, best_bid, best_ask, midpoint, spread, relative_spread,
        bid_depth, ask_depth, trade_count, trade_volume, open_interest, up_exposure, down_exposure,
        order_flow_imbalance, queue_imbalance, microprice, price_implied_probability, capital_skew
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.stmtInsertTrade = this.db.prepare(`
      INSERT OR IGNORE INTO trades (
        id, market_id, tx_hash, log_index, block_number, timestamp, trader, direction, price, size, collateral_amount, is_maker
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.stmtUpsertParticipant = this.db.prepare(`
      INSERT INTO participants (address, first_seen_timestamp, last_seen_timestamp, total_trades, total_volume)
      VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(address) DO UPDATE SET
        last_seen_timestamp = excluded.last_seen_timestamp,
        total_trades = total_trades + 1,
        total_volume = total_volume + excluded.total_volume
    `);

    this.stmtInsertPrediction = this.db.prepare(`
      INSERT OR IGNORE INTO predictions (
        id, trader, market_id, timestamp, block_number, tx_hash, direction, size, confidence, market_probability_at_call, outcome
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);

    this.stmtUpsertReputation = this.db.prepare(`
      INSERT INTO reputation_scores (
        trader, ens_or_short, predictor_score, accuracy, total_predictions, resolved_predictions,
        bayesian_accuracy_mean, credible_interval_low, credible_interval_high, market_relative_skill,
        mean_brier_score, reliability, resolution, uncertainty, recency_weighted_skill, skill_trend,
        calibration_score, consistency_score, effective_sample_size, is_verified, rank, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(trader) DO UPDATE SET
        ens_or_short = excluded.ens_or_short,
        predictor_score = excluded.predictor_score,
        accuracy = excluded.accuracy,
        total_predictions = excluded.total_predictions,
        resolved_predictions = excluded.resolved_predictions,
        bayesian_accuracy_mean = excluded.bayesian_accuracy_mean,
        credible_interval_low = excluded.credible_interval_low,
        credible_interval_high = excluded.credible_interval_high,
        market_relative_skill = excluded.market_relative_skill,
        mean_brier_score = excluded.mean_brier_score,
        reliability = excluded.reliability,
        resolution = excluded.resolution,
        uncertainty = excluded.uncertainty,
        recency_weighted_skill = excluded.recency_weighted_skill,
        skill_trend = excluded.skill_trend,
        calibration_score = excluded.calibration_score,
        consistency_score = excluded.consistency_score,
        effective_sample_size = excluded.effective_sample_size,
        is_verified = excluded.is_verified,
        rank = excluded.rank,
        updated_at = excluded.updated_at
    `);

    this.stmtInsertSignal = this.db.prepare(`
      INSERT INTO crowd_signals (
        asset, timestamp, block_number, latent_probability, uncertainty_lower, uncertainty_upper,
        mid_probability, micro_probability, entropy, information_velocity, changepoint_probability,
        market_regime, effective_participants, concentration_hhi, open_interest, capital_skew,
        provenance_hash, algorithm_version, input_snapshot_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.stmtInsertDivergence = this.db.prepare(`
      INSERT INTO divergence_observations (
        asset, timestamp, crowd_up_probability, top_predictor_consensus, divergence_percent,
        effective_predictor_count, persistence_score, interpretation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.stmtInsertProvenance = this.db.prepare(`
      INSERT OR REPLACE INTO provenance_records (
        signal_hash, asset, algorithm_version, input_snapshot_hash, timestamp, source_block, source_timestamp, payload_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    this.stmtGetCursor = this.db.prepare(`
      SELECT last_processed_block, last_processed_timestamp FROM indexer_cursors WHERE cursor_key = ?
    `);

    this.stmtSetCursor = this.db.prepare(`
      INSERT INTO indexer_cursors (cursor_key, last_processed_block, last_processed_timestamp, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(cursor_key) DO UPDATE SET
        last_processed_block = excluded.last_processed_block,
        last_processed_timestamp = excluded.last_processed_timestamp,
        updated_at = excluded.updated_at
    `);
  }

  // --- Cursors (Restart-Safe) ---
  public getCursor(key: string): { lastBlock: number; lastTimestamp: number } | null {
    const row = this.stmtGetCursor.get(key);
    if (!row) return null;
    return {
      lastBlock: Number(row.last_processed_block),
      lastTimestamp: Number(row.last_processed_timestamp),
    };
  }

  public setCursor(key: string, blockNumber: number, timestamp: number) {
    this.stmtSetCursor.run(key, blockNumber, timestamp, Math.floor(Date.now() / 1000));
  }

  // --- Ingestion & Writing ---
  public upsertMarket(market: DBMarket) {
    this.stmtUpsertMarket.run(
      market.market_id,
      market.asset,
      market.symbol,
      market.interval_sec,
      market.status,
      market.expiry,
      market.pool_address,
      market.collateral_address,
      market.created_at_block,
      market.created_at_timestamp,
      market.updated_at
    );
  }

  public insertSnapshot(s: any) {
    this.stmtInsertSnapshot.run(
      s.market_id,
      s.timestamp,
      s.block_number ?? null,
      s.best_bid ?? null,
      s.best_ask ?? null,
      s.midpoint ?? null,
      s.spread ?? null,
      s.relative_spread ?? null,
      s.bid_depth ?? null,
      s.ask_depth ?? null,
      s.trade_count ?? 0,
      s.trade_volume ?? 0,
      s.open_interest ?? null,
      s.up_exposure ?? null,
      s.down_exposure ?? null,
      s.order_flow_imbalance ?? null,
      s.queue_imbalance ?? null,
      s.microprice ?? null,
      s.price_implied_probability ?? null,
      s.capital_skew ?? null
    );
  }

  public insertTrade(t: DBTrade) {
    this.stmtInsertTrade.run(
      t.id,
      t.market_id,
      t.tx_hash,
      t.log_index,
      t.block_number,
      t.timestamp,
      t.trader,
      t.direction,
      t.price,
      t.size,
      t.collateral_amount,
      t.is_maker
    );

    // Track participant
    this.stmtUpsertParticipant.run(t.trader, t.timestamp, t.timestamp, t.collateral_amount);

    // Derive prediction from trade if it represents an observable probabilistic position
    const predictionId = `${t.trader}_${t.market_id}_${t.tx_hash}_${t.log_index}`;
    // Observable execution price in binary contracts represents empirical hurdle probability
    const isValidProbabilityPrice = typeof t.price === "number" && t.price > 0 && t.price < 1;
    const empiricalConfidence = isValidProbabilityPrice
      ? (t.direction === "UP" ? t.price : 1 - t.price)
      : null;

    this.stmtInsertPrediction.run(
      predictionId,
      t.trader,
      t.market_id,
      t.timestamp,
      t.block_number,
      t.tx_hash,
      t.direction,
      t.size,
      empiricalConfidence,
      t.price
    );
  }

  public recordSettlement(marketId: string, txHash: string, blockNumber: number, timestamp: number, winningOutcome: number, settlementPrice?: number) {
    this.db.prepare(`
      INSERT OR REPLACE INTO settlements (market_id, tx_hash, block_number, timestamp, winning_outcome, settlement_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(marketId, txHash, blockNumber, timestamp, winningOutcome, settlementPrice ?? null);

    // Update market status
    this.db.prepare(`
      UPDATE markets SET status = 'Resolved', updated_at = ? WHERE market_id = ?
    `).run(timestamp, marketId);

    // Resolve predictions
    const predictions = this.db.prepare(`SELECT * FROM predictions WHERE market_id = ? AND outcome = 'Pending'`).all(marketId);
    for (const p of predictions) {
      const isUp = p.direction === "UP";
      const won = (winningOutcome === 1 && isUp) || (winningOutcome === 0 && !isUp);
      const outcome = winningOutcome === -1 ? "Voided" : won ? "Correct" : "Incorrect";
      
      const forecastProb = isUp ? p.market_probability_at_call : 1 - p.market_probability_at_call;
      const actualOutcome = won ? 1 : 0;
      const brierScore = Math.pow(forecastProb - actualOutcome, 2);
      const benchmarkBs = Math.pow(0.5 - actualOutcome, 2);
      const bss = benchmarkBs > 0 ? 1 - (brierScore / benchmarkBs) : 0;

      this.db.prepare(`
        UPDATE predictions SET
          outcome = ?,
          brier_score = ?,
          brier_skill_score = ?,
          resolved_at = ?
        WHERE id = ?
      `).run(outcome, brierScore, bss, timestamp, p.id);
    }
  }

  public upsertReputationScore(r: DBReputationScore) {
    this.stmtUpsertReputation.run(
      r.trader,
      r.ens_or_short,
      r.predictor_score,
      r.accuracy,
      r.total_predictions,
      r.resolved_predictions,
      r.bayesian_accuracy_mean,
      r.credible_interval_low,
      r.credible_interval_high,
      r.market_relative_skill,
      r.mean_brier_score,
      r.reliability,
      r.resolution,
      r.uncertainty,
      r.recency_weighted_skill,
      r.skill_trend,
      r.calibration_score,
      r.consistency_score,
      r.effective_sample_size,
      r.is_verified,
      r.rank,
      r.updated_at
    );
  }

  public insertCrowdSignal(s: DBCrowdSignal) {
    this.stmtInsertSignal.run(
      s.asset,
      s.timestamp,
      s.block_number,
      s.latent_probability,
      s.uncertainty_lower,
      s.uncertainty_upper,
      s.mid_probability,
      s.micro_probability,
      s.entropy,
      s.information_velocity,
      s.changepoint_probability,
      s.market_regime,
      s.effective_participants,
      s.concentration_hhi,
      s.open_interest,
      s.capital_skew,
      s.provenance_hash,
      s.algorithm_version,
      s.input_snapshot_hash
    );

    this.stmtInsertProvenance.run(
      s.provenance_hash,
      s.asset,
      s.algorithm_version,
      s.input_snapshot_hash,
      s.timestamp,
      s.block_number,
      s.timestamp,
      JSON.stringify(s)
    );
  }

  public insertDivergence(d: any) {
    this.stmtInsertDivergence.run(
      d.asset,
      d.timestamp,
      d.crowd_up_probability,
      d.top_predictor_consensus ?? null,
      d.divergence_percent ?? null,
      d.effective_predictor_count,
      d.persistence_score,
      d.interpretation
    );
  }

  // --- High Performance Fast Queries ---
  public getLatestSignal(asset: string): DBCrowdSignal | null {
    const row = this.db.prepare(`
      SELECT * FROM crowd_signals WHERE asset = ? ORDER BY timestamp DESC LIMIT 1
    `).get(asset);
    return row as DBCrowdSignal | null;
  }

  public getSignalHistory(asset: string, limit = 100): DBCrowdSignal[] {
    const rows = this.db.prepare(`
      SELECT * FROM crowd_signals WHERE asset = ? ORDER BY timestamp DESC LIMIT ?
    `).all(asset, limit);
    return rows as DBCrowdSignal[];
  }

  public getActiveMarkets(): any[] {
    return this.db.prepare(`
      SELECT m.*, s.best_bid, s.best_ask, s.midpoint, s.spread, s.queue_imbalance, s.microprice, s.open_interest, s.trade_volume
      FROM markets m
      LEFT JOIN (
        SELECT market_id, best_bid, best_ask, midpoint, spread, queue_imbalance, microprice, open_interest, trade_volume,
               ROW_NUMBER() OVER (PARTITION BY market_id ORDER BY timestamp DESC) as rn
        FROM market_snapshots
      ) s ON m.market_id = s.market_id AND s.rn = 1
      ORDER BY m.expiry ASC
    `).all();
  }

  public getLeaderboard(limit = 50): DBReputationScore[] {
    return this.db.prepare(`
      SELECT * FROM reputation_scores ORDER BY rank ASC LIMIT ?
    `).all(limit) as DBReputationScore[];
  }

  public getTraderProfile(address: string): { profile: DBReputationScore | null; predictions: any[] } {
    const profile = this.db.prepare(`SELECT * FROM reputation_scores WHERE trader = ?`).get(address) as DBReputationScore | null;
    const predictions = this.db.prepare(`
      SELECT * FROM predictions WHERE trader = ? ORDER BY timestamp DESC LIMIT 100
    `).all(address);
    return { profile, predictions };
  }

  public getLatestDivergence(asset: string): any | null {
    return this.db.prepare(`
      SELECT * FROM divergence_observations WHERE asset = ? ORDER BY timestamp DESC LIMIT 1
    `).get(asset);
  }

  public getAllParticipantsCount(): number {
    const row = this.db.prepare(`SELECT COUNT(*) as cnt FROM participants`).get();
    return Number(row?.cnt || 0);
  }

  public getTradeCount(): number {
    const row = this.db.prepare(`SELECT COUNT(*) as cnt FROM trades`).get();
    return Number(row?.cnt || 0);
  }
}

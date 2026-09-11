import {
  AssetSymbol,
  CalculatedMarketSignal,
  CalculatedTraderReputation,
  CrowdVsPredictorDivergence,
  ObservedMarketWindow,
} from "../normalize/types.js";
import { EvaluatedCallInput } from "../scoring/reputation.js";

/**
 * In-Memory Data Store for CrowdSignal Indexer
 * Persists observed market windows, historical signals, predictor calls, and provenance snapshots.
 * Zero hardcoded seed data in production runtime.
 */
export class DataStore {
  private static instance: DataStore;

  public markets: Map<string, ObservedMarketWindow> = new Map();
  public signals: Map<AssetSymbol, CalculatedMarketSignal> = new Map();
  public divergences: Map<AssetSymbol, CrowdVsPredictorDivergence> = new Map();
  public predictors: Map<`0x${string}`, CalculatedTraderReputation> = new Map();
  public predictorHistory: Map<`0x${string}`, EvaluatedCallInput[]> = new Map();
  public signalHistory: Map<AssetSymbol, CalculatedMarketSignal[]> = new Map();

  private constructor() {
    // Initial state begins unseeded; populated solely via ingestion or verified historical fixtures in test mode
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  public addSignalHistory(signal: CalculatedMarketSignal) {
    const list = this.signalHistory.get(signal.asset) || [];
    list.push(signal);
    if (list.length > 300) list.shift();
    this.signalHistory.set(signal.asset, list);
    this.signals.set(signal.asset, signal);
  }

  public recordPrediction(call: EvaluatedCallInput) {
    const traderKey = call.predictionId.split("_")[0] as `0x${string}`;
    const list = this.predictorHistory.get(traderKey) || [];
    list.push(call);
    this.predictorHistory.set(traderKey, list);
  }

  public clear() {
    this.markets.clear();
    this.signals.clear();
    this.divergences.clear();
    this.predictors.clear();
    this.predictorHistory.clear();
    this.signalHistory.clear();
  }
}

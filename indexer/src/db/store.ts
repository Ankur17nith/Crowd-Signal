import { AssetSymbol, CalculatedMarketSignal, CalculatedTraderReputation, CrowdVsPredictorDivergence, RawMarketWindow } from "../normalize/types.js";
import { TraderResolvedCall } from "../scoring/reputation.js";

export class DataStore {
  private static instance: DataStore;

  public markets: Map<string, RawMarketWindow> = new Map();
  public signals: Map<AssetSymbol, CalculatedMarketSignal> = new Map();
  public divergences: Map<AssetSymbol, CrowdVsPredictorDivergence> = new Map();
  public predictors: Map<`0x${string}`, CalculatedTraderReputation> = new Map();
  public predictorHistory: Map<`0x${string}`, TraderResolvedCall[]> = new Map();
  public signalHistory: Map<AssetSymbol, CalculatedMarketSignal[]> = new Map();

  private constructor() {
    this.seedInitialData();
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
    if (list.length > 200) list.shift();
    this.signalHistory.set(signal.asset, list);
    this.signals.set(signal.asset, signal);
  }

  public seedInitialData() {
    const now = Math.floor(Date.now() / 1000);

    // Seed Active Event Contract Windows
    const btcMarket1: RawMarketWindow = {
      marketId: "0xbtc_15m_window_01",
      asset: "BTC",
      symbol: "BTC-15M-UPDOWN",
      intervalSec: 900,
      openPrice: 64200,
      bestBid: 0.638,
      bestAsk: 0.646,
      lastPrice: 0.642,
      openInterestUsd: 182430,
      openInterestUp: 117120,
      openInterestDown: 65310,
      cumulativeQuoteVolume: 91220,
      tradeCount: 342,
      status: "Trading",
      expiry: now + 522, // 8m 42s remaining
      timestamp: now,
    };

    const btcMarket2: RawMarketWindow = {
      marketId: "0xbtc_5m_window_02",
      asset: "BTC",
      symbol: "BTC-5M-UPDOWN",
      intervalSec: 300,
      openPrice: 64180,
      bestBid: 0.64,
      bestAsk: 0.65,
      lastPrice: 0.645,
      openInterestUsd: 64200,
      openInterestUp: 41000,
      openInterestDown: 23200,
      cumulativeQuoteVolume: 32100,
      tradeCount: 115,
      status: "Trading",
      expiry: now + 180,
      timestamp: now,
    };

    const ethMarket: RawMarketWindow = {
      marketId: "0xeth_15m_window_01",
      asset: "ETH",
      symbol: "ETH-15M-UPDOWN",
      intervalSec: 900,
      openPrice: 3450,
      bestBid: 0.582,
      bestAsk: 0.592,
      lastPrice: 0.587,
      openInterestUsd: 95400,
      openInterestUp: 55400,
      openInterestDown: 40000,
      cumulativeQuoteVolume: 48000,
      tradeCount: 188,
      status: "Trading",
      expiry: now + 640,
      timestamp: now,
    };

    const solMarket: RawMarketWindow = {
      marketId: "0xsol_15m_window_01",
      asset: "SOL",
      symbol: "SOL-15M-UPDOWN",
      intervalSec: 900,
      openPrice: 152,
      bestBid: 0.51,
      bestAsk: 0.525,
      lastPrice: 0.518,
      openInterestUsd: 42100,
      openInterestUp: 22100,
      openInterestDown: 20000,
      cumulativeQuoteVolume: 21500,
      tradeCount: 78,
      status: "Trading",
      expiry: now + 420,
      timestamp: now,
    };

    this.markets.set(btcMarket1.marketId, btcMarket1);
    this.markets.set(btcMarket2.marketId, btcMarket2);
    this.markets.set(ethMarket.marketId, ethMarket);
    this.markets.set(solMarket.marketId, solMarket);

    // Seed historical time series for BTC probability chart
    const btcHistory: CalculatedMarketSignal[] = [];
    const baseProb = 0.42;
    const steps = 30;
    for (let i = steps; i >= 0; i--) {
      const t = now - i * 60;
      const progress = (steps - i) / steps;
      // Probability climbs from 42% to 64.2%
      const prob = baseProb + progress * 0.222 + (Math.sin(i) * 0.015);
      const probBps = Math.round(prob * 10000);
      btcHistory.push({
        asset: "BTC",
        assetKey: "0x" as `0x${string}`,
        upProbability: Number(prob.toFixed(4)),
        upProbabilityBps: probBps,
        downProbabilityBps: 10000 - probBps,
        capitalSkew: Number((0.10 + progress * 0.184).toFixed(4)),
        capitalSkewBps: Math.round((0.10 + progress * 0.184) * 10000),
        confidenceScore: Math.min(87, Math.round(65 + progress * 22)),
        velocityBpsPerMin: 720,
        accelerationBpsPerMin2: 50,
        openInterestUsd: Math.round(110000 + progress * 72430),
        totalVolumeUsd: Math.round(40000 + progress * 51220),
        activeWindowCount: 2,
        marketRegime: "BULLISH",
        timestamp: t,
      });
    }
    this.signalHistory.set("BTC", btcHistory);
    this.signals.set("BTC", btcHistory[btcHistory.length - 1]);

    // Seed Verified Predictor Profiles (demonstrating sample size calibration vs lucky trader)
    this.seedPredictors(now);
  }

  private seedPredictors(now: number) {
    // Trader 1: Veteran high-frequency predictor (247 predictions, 71.4% accuracy, Score 91)
    const trader1: `0x${string}` = "0x71A9908C8E645d9441faB8B33Af671239c36892F";
    const calls1: TraderResolvedCall[] = [];
    for (let i = 230; i >= 0; i--) {
      const isWin = (i % 7 !== 0 && i % 9 !== 0); // ~72% win rate
      calls1.push({
        predictionId: `pred_1_${i}`,
        asset: i % 2 === 0 ? "BTC" : "ETH",
        direction: i % 3 === 0 ? "DOWN" : "UP",
        confidence: Number((0.65 + (i % 30) * 0.01).toFixed(2)),
        actualOutcome: isWin ? (i % 3 === 0 ? "DOWN" : "UP") : (i % 3 === 0 ? "UP" : "DOWN"),
        isCorrect: isWin,
        timestamp: now - i * 3600,
      });
    }
    this.predictorHistory.set(trader1, calls1);
    this.predictors.set(trader1, {
      address: trader1,
      totalPredictions: 247,
      resolvedPredictions: 231,
      correctPredictions: 165,
      accuracy: 0.714,
      accuracyBps: 7140,
      predictorScore: 91,
      calibrationScore: 89,
      consistencyScore: 82,
      currentStreak: 6,
      maxStreak: 14,
      lastActiveTimestamp: now - 120,
      isVerified: true,
      calibrationBuckets: [
        { confidenceRange: "50-60%", predictedCount: 32, actualWinRate: 0.531, expectedConfidence: 0.55 },
        { confidenceRange: "60-70%", predictedCount: 88, actualWinRate: 0.670, expectedConfidence: 0.65 },
        { confidenceRange: "70-80%", predictedCount: 75, actualWinRate: 0.747, expectedConfidence: 0.75 },
        { confidenceRange: "80-90%", predictedCount: 28, actualWinRate: 0.857, expectedConfidence: 0.85 },
        { confidenceRange: "90-100%", predictedCount: 8, actualWinRate: 0.875, expectedConfidence: 0.95 },
      ],
    });

    // Trader 2: Sharp macro predictor (142 predictions, 68.3% accuracy, Score 86)
    const trader2: `0x${string}` = "0xA91C283F41982bde9204A841E3486a4392C10892";
    this.predictors.set(trader2, {
      address: trader2,
      totalPredictions: 148,
      resolvedPredictions: 142,
      correctPredictions: 97,
      accuracy: 0.683,
      accuracyBps: 6830,
      predictorScore: 86,
      calibrationScore: 85,
      consistencyScore: 84,
      currentStreak: 4,
      maxStreak: 11,
      lastActiveTimestamp: now - 600,
      isVerified: true,
      calibrationBuckets: [
        { confidenceRange: "50-60%", predictedCount: 20, actualWinRate: 0.550, expectedConfidence: 0.55 },
        { confidenceRange: "60-70%", predictedCount: 62, actualWinRate: 0.661, expectedConfidence: 0.65 },
        { confidenceRange: "70-80%", predictedCount: 44, actualWinRate: 0.727, expectedConfidence: 0.75 },
        { confidenceRange: "80-90%", predictedCount: 16, actualWinRate: 0.812, expectedConfidence: 0.85 },
      ],
    });

    // Trader 3: Volatility specialist (98 predictions, 66.3% accuracy, Score 81)
    const trader3: `0x${string}` = "0x72BC908221804B3519c8120dE3F57108947231A8";
    this.predictors.set(trader3, {
      address: trader3,
      totalPredictions: 104,
      resolvedPredictions: 98,
      correctPredictions: 65,
      accuracy: 0.663,
      accuracyBps: 6630,
      predictorScore: 81,
      calibrationScore: 80,
      consistencyScore: 78,
      currentStreak: 2,
      maxStreak: 9,
      lastActiveTimestamp: now - 1800,
      isVerified: true,
      calibrationBuckets: [
        { confidenceRange: "50-60%", predictedCount: 18, actualWinRate: 0.555, expectedConfidence: 0.55 },
        { confidenceRange: "60-70%", predictedCount: 50, actualWinRate: 0.640, expectedConfidence: 0.65 },
        { confidenceRange: "70-80%", predictedCount: 30, actualWinRate: 0.733, expectedConfidence: 0.75 },
      ],
    });

    // Trader 4: "Lucky Trader" (2 predictions, 100% win rate -> Score 42, NOT verified)
    const trader4: `0x${string}` = "0x38B5201A94C720a4b0811eE924C108529C0098F2";
    this.predictors.set(trader4, {
      address: trader4,
      totalPredictions: 2,
      resolvedPredictions: 2,
      correctPredictions: 2,
      accuracy: 1.0,
      accuracyBps: 10000,
      predictorScore: 42, // Penalized heavily by sample size
      calibrationScore: 50,
      consistencyScore: 40,
      currentStreak: 2,
      maxStreak: 2,
      lastActiveTimestamp: now - 3600,
      isVerified: false,
      calibrationBuckets: [],
    });
  }
}

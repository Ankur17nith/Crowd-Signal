import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { CONFIG, somniaShannon } from "../config/env.js";
import { CalculatedMarketSignal, CalculatedTraderReputation } from "../normalize/types.js";

const SENTIMENT_PUBLISHER_ABI = parseAbi([
  "function publishSignal(bytes32 assetKey, (uint16 upProbabilityBps, int16 capitalSkewBps, uint16 confidenceScore, int16 velocityBpsPerMin, int16 accelerationBpsPerMin2, uint64 timestamp, uint64 openInterestUsd, uint64 totalVolumeUsd, uint32 activeWindowCount) signal) external",
  "function publishSignalBatch(bytes32[] assetKeys, (uint16 upProbabilityBps, int16 capitalSkewBps, uint16 confidenceScore, int16 velocityBpsPerMin, int16 accelerationBpsPerMin2, uint64 timestamp, uint64 openInterestUsd, uint64 totalVolumeUsd, uint32 activeWindowCount)[] signals) external",
]);

const REPUTATION_REGISTRY_ABI = parseAbi([
  "function updateReputationBatch(address[] predictors, (uint32 totalPredictions, uint32 resolvedPredictions, uint32 correctPredictions, uint16 predictorScore, uint16 accuracyBps, uint16 calibrationScore, uint16 consistencyScore, uint32 currentStreak, uint32 maxStreak, uint64 lastActiveTimestamp)[] reps) external",
]);

export class OnchainPublisher {
  private account?: ReturnType<typeof privateKeyToAccount>;
  private walletClient?: ReturnType<typeof createWalletClient>;
  private publicClient: ReturnType<typeof createPublicClient>;

  constructor() {
    this.publicClient = createPublicClient({
      chain: somniaShannon,
      transport: http(CONFIG.rpcUrl),
    });

    if (CONFIG.publisherPrivateKey && CONFIG.publisherPrivateKey.startsWith("0x") && CONFIG.publisherPrivateKey.length === 66) {
      try {
        this.account = privateKeyToAccount(CONFIG.publisherPrivateKey);
        this.walletClient = createWalletClient({
          account: this.account,
          chain: somniaShannon,
          transport: http(CONFIG.rpcUrl),
        });
      } catch (err) {
        console.warn("[SECURITY] Invalid PUBLISHER_PRIVATE_KEY provided. OnchainPublisher running in DRY-RUN mode.");
      }
    } else {
      console.warn("[SECURITY] No valid PUBLISHER_PRIVATE_KEY provided in environment. OnchainPublisher operating in DRY-RUN / observer mode.");
    }
  }

  public async publishSignal(signal: CalculatedMarketSignal): Promise<`0x${string}` | null> {
    if (
      !this.walletClient ||
      !CONFIG.sentimentPublisherAddress ||
      CONFIG.sentimentPublisherAddress === "0x0000000000000000000000000000000000000000"
    ) {
      console.log(
        `[OBSERVER/DRY-RUN] Signal recorded for ${signal.asset}: UP ${signal.upProbabilityBps / 100}% | Skew: ${
          signal.capitalSkewBps / 100
        }% | Confidence: ${signal.confidenceScore}`
      );
      return null;
    }

    try {
      const hash = await this.walletClient.writeContract({
        address: CONFIG.sentimentPublisherAddress,
        abi: SENTIMENT_PUBLISHER_ABI,
        functionName: "publishSignal",
        args: [
          signal.assetKey,
          {
            upProbabilityBps: signal.upProbabilityBps,
            capitalSkewBps: signal.capitalSkewBps,
            confidenceScore: signal.confidenceScore,
            velocityBpsPerMin: signal.velocityBpsPerMin,
            accelerationBpsPerMin2: signal.accelerationBpsPerMin2,
            timestamp: BigInt(signal.timestamp),
            openInterestUsd: BigInt(signal.openInterestUsd),
            totalVolumeUsd: BigInt(signal.totalVolumeUsd),
            activeWindowCount: signal.activeWindowCount,
          },
        ],
      });
      console.log(`[ON-CHAIN] Published ${signal.asset} signal in tx ${hash}`);
      return hash;
    } catch (err) {
      console.error(`Failed to publish on-chain signal for ${signal.asset}:`, err);
      return null;
    }
  }

  public async publishReputations(reputations: CalculatedTraderReputation[]): Promise<`0x${string}` | null> {
    if (
      !this.walletClient ||
      !CONFIG.reputationRegistryAddress ||
      CONFIG.reputationRegistryAddress === "0x0000000000000000000000000000000000000000" ||
      reputations.length === 0
    ) {
      return null;
    }

    try {
      const addrs = reputations.map((r) => r.address);
      const structs = reputations.map((r) => ({
        totalPredictions: r.totalPredictions,
        resolvedPredictions: r.resolvedPredictions,
        correctPredictions: r.correctPredictions,
        predictorScore: r.predictorScore,
        accuracyBps: r.accuracyBps,
        calibrationScore: r.calibrationScore,
        consistencyScore: r.consistencyScore,
        currentStreak: r.currentStreak,
        maxStreak: r.maxStreak,
        lastActiveTimestamp: BigInt(r.lastActiveTimestamp),
      }));

      const hash = await this.walletClient.writeContract({
        address: CONFIG.reputationRegistryAddress,
        abi: REPUTATION_REGISTRY_ABI,
        functionName: "updateReputationBatch",
        args: [addrs, structs],
      });
      console.log(`[ON-CHAIN] Published batch reputations in tx ${hash}`);
      return hash;
    } catch (err) {
      console.error("Failed to publish on-chain reputations:", err);
      return null;
    }
  }
}

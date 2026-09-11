// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ISentimentPublisher } from "./interfaces/ISentimentPublisher.sol";
import { IReputationRegistry } from "./interfaces/IReputationRegistry.sol";

/**
 * @title DemoConsumer
 * @notice Example external application/protocol smart contract demonstrating how a DAO,
 *         DeFi protocol, AI Agent, or Game consumes CrowdSignal live intelligence directly on Somnia.
 */
contract DemoConsumer {
    ISentimentPublisher public immutable publisher;
    IReputationRegistry public immutable reputation;

    enum MarketRegime {
        NEUTRAL,
        BULLISH_SURGE,
        BEARISH_RETREAT,
        HIGH_VOLATILITY_ALERT
    }

    struct ConsumptionReport {
        bytes32 assetKey;
        uint16 upProbabilityBps;
        int16 capitalSkewBps;
        uint16 confidenceScore;
        int16 velocityBpsPerMin;
        MarketRegime regime;
        bool isDefensiveModeActive;
        uint64 timestamp;
    }

    event DefensiveModeToggled(bool active, string reason);
    event StrategyExecuted(bytes32 indexed assetKey, MarketRegime regime, uint16 upProbabilityBps);

    uint16 public bullishThresholdBps = 6000; // 60.00%
    uint16 public bearishThresholdBps = 4000; // 40.00%
    uint16 public minConfidenceRequired = 70; // 70/100

    bool public defensiveMode;

    constructor(address _publisher, address _reputation) {
        publisher = ISentimentPublisher(_publisher);
        reputation = IReputationRegistry(_reputation);
    }

    function evaluateMarket(string calldata symbol) external view returns (ConsumptionReport memory report) {
        ISentimentPublisher.MarketSignal memory signal = publisher.getSignalBySymbol(symbol);
        bytes32 assetKey = keccak256(abi.encodePacked(symbol));

        MarketRegime regime = MarketRegime.NEUTRAL;
        bool defMode = false;

        // Deterministic regime classification
        if (signal.confidenceScore >= minConfidenceRequired) {
            if (signal.upProbabilityBps >= bullishThresholdBps && signal.velocityBpsPerMin > 0) {
                regime = MarketRegime.BULLISH_SURGE;
            } else if (signal.upProbabilityBps <= bearishThresholdBps && signal.velocityBpsPerMin < 0) {
                regime = MarketRegime.BEARISH_RETREAT;
                defMode = true;
            }
        } else if (signal.velocityBpsPerMin > 1000 || signal.velocityBpsPerMin < -1000) {
            regime = MarketRegime.HIGH_VOLATILITY_ALERT;
            defMode = true;
        }

        report = ConsumptionReport({
            assetKey: assetKey,
            upProbabilityBps: signal.upProbabilityBps,
            capitalSkewBps: signal.capitalSkewBps,
            confidenceScore: signal.confidenceScore,
            velocityBpsPerMin: signal.velocityBpsPerMin,
            regime: regime,
            isDefensiveModeActive: defMode,
            timestamp: signal.timestamp
        });
    }

    function executeStrategy(string calldata symbol) external returns (MarketRegime currentRegime) {
        ConsumptionReport memory report = this.evaluateMarket(symbol);
        currentRegime = report.regime;

        if (report.isDefensiveModeActive && !defensiveMode) {
            defensiveMode = true;
            emit DefensiveModeToggled(true, "High volatility or Bearish market detected by CrowdSignal");
        } else if (!report.isDefensiveModeActive && defensiveMode) {
            defensiveMode = false;
            emit DefensiveModeToggled(false, "Normal market condition restored");
        }

        emit StrategyExecuted(report.assetKey, currentRegime, report.upProbabilityBps);
    }

    function verifyPredictorBeforeGrant(address trader) external view returns (bool eligible, uint16 score) {
        IReputationRegistry.PredictorReputation memory rep = reputation.getReputation(trader);
        bool verified = reputation.isVerifiedPredictor(trader);
        return (verified && rep.accuracyBps >= 6500, rep.predictorScore);
    }

    function verifySignalProvenance(
        bytes32 assetKey,
        bytes32 expectedAlgorithmHash
    ) external view returns (bool isValid, uint64 anchoredTime) {
        ISentimentPublisher.ProvenanceRecord memory rec = publisher.getProvenance(assetKey);
        bool valid = rec.algorithmVersionHash == expectedAlgorithmHash && rec.signalHash != bytes32(0);
        return (valid, rec.timestamp);
    }
}

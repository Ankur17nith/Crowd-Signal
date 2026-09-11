// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { SentimentPublisher } from "../src/SentimentPublisher.sol";
import { ReputationRegistry } from "../src/ReputationRegistry.sol";
import { DemoConsumer } from "../src/DemoConsumer.sol";
import { ISentimentPublisher } from "../src/interfaces/ISentimentPublisher.sol";
import { IReputationRegistry } from "../src/interfaces/IReputationRegistry.sol";

contract DemoConsumerTest is Test {
    SentimentPublisher public publisher;
    ReputationRegistry public registry;
    DemoConsumer public consumer;

    address public admin = address(0x1);
    bytes32 public btcKey = keccak256(abi.encodePacked("BTC"));

    function setUp() public {
        vm.startPrank(admin);
        publisher = new SentimentPublisher(admin);
        registry = new ReputationRegistry(admin);
        consumer = new DemoConsumer(address(publisher), address(registry));
        vm.stopPrank();
    }

    function test_EvaluateMarket_BullishRegime() public {
        ISentimentPublisher.MarketSignal memory signal = ISentimentPublisher.MarketSignal({
            upProbabilityBps: 6500,       // 65.00%
            capitalSkewBps: 3000,         // +30.00%
            confidenceScore: 85,          // > 70
            velocityBpsPerMin: 500,       // Positive velocity
            accelerationBpsPerMin2: 10,
            timestamp: uint64(block.timestamp),
            openInterestUsd: 150000,
            totalVolumeUsd: 80000,
            activeWindowCount: 3
        });

        vm.prank(admin);
        publisher.publishSignal(btcKey, signal);

        DemoConsumer.ConsumptionReport memory report = consumer.evaluateMarket("BTC");
        assertEq(uint8(report.regime), uint8(DemoConsumer.MarketRegime.BULLISH_SURGE));
        assertFalse(report.isDefensiveModeActive);
    }

    function test_EvaluateMarket_BearishRetreat_ActivatesDefensiveMode() public {
        ISentimentPublisher.MarketSignal memory signal = ISentimentPublisher.MarketSignal({
            upProbabilityBps: 3500,       // 35.00%
            capitalSkewBps: -2500,        // -25.00%
            confidenceScore: 80,          // > 70
            velocityBpsPerMin: -600,      // Negative velocity
            accelerationBpsPerMin2: -20,
            timestamp: uint64(block.timestamp),
            openInterestUsd: 120000,
            totalVolumeUsd: 60000,
            activeWindowCount: 2
        });

        vm.prank(admin);
        publisher.publishSignal(btcKey, signal);

        DemoConsumer.ConsumptionReport memory report = consumer.evaluateMarket("BTC");
        assertEq(uint8(report.regime), uint8(DemoConsumer.MarketRegime.BEARISH_RETREAT));
        assertTrue(report.isDefensiveModeActive);

        // Execute strategy and verify state toggles
        consumer.executeStrategy("BTC");
        assertTrue(consumer.defensiveMode());
    }

    function test_VerifyPredictorBeforeGrant() public {
        address skilledTrader = address(0x99);
        IReputationRegistry.PredictorReputation memory rep = IReputationRegistry.PredictorReputation({
            totalPredictions: 50,
            resolvedPredictions: 50,
            correctPredictions: 38,
            predictorScore: 85,
            accuracyBps: 7600, // 76%
            calibrationScore: 84,
            consistencyScore: 80,
            currentStreak: 4,
            maxStreak: 8,
            lastActiveTimestamp: uint64(block.timestamp)
        });

        vm.prank(admin);
        registry.updateReputation(skilledTrader, rep);

        (bool eligible, uint16 score) = consumer.verifyPredictorBeforeGrant(skilledTrader);
        assertTrue(eligible);
        assertEq(score, 85);
    }
}

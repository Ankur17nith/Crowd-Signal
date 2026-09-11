// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { SentimentPublisher } from "../src/SentimentPublisher.sol";
import { ISentimentPublisher } from "../src/interfaces/ISentimentPublisher.sol";
import { CrowdSignalLib } from "../src/libraries/CrowdSignalLib.sol";

contract SentimentPublisherTest is Test {
    SentimentPublisher public publisher;
    address public owner = address(0x1);
    address public publisherAgent = address(0x2);
    address public unauthorizedUser = address(0x3);

    bytes32 public btcKey = keccak256(abi.encodePacked("BTC"));
    bytes32 public ethKey = keccak256(abi.encodePacked("ETH"));

    function setUp() public {
        vm.prank(owner);
        publisher = new SentimentPublisher(publisherAgent);
    }

    function test_InitialState() public view {
        assertEq(publisher.owner(), owner);
        assertEq(publisher.publisher(), publisherAgent);
        assertFalse(publisher.hasSignal(btcKey));
    }

    function test_PublishSignal_Success() public {
        ISentimentPublisher.MarketSignal memory signal = ISentimentPublisher.MarketSignal({
            upProbabilityBps: 6420,       // 64.20%
            capitalSkewBps: 2840,         // +28.40%
            confidenceScore: 87,          // 87/100
            velocityBpsPerMin: 720,       // +7.2%/min
            accelerationBpsPerMin2: 50,
            timestamp: uint64(block.timestamp),
            openInterestUsd: 182430,
            totalVolumeUsd: 91220,
            activeWindowCount: 4
        });

        vm.prank(publisherAgent);
        publisher.publishSignal(btcKey, signal);

        assertTrue(publisher.hasSignal(btcKey));
        ISentimentPublisher.MarketSignal memory retrieved = publisher.getSignal(btcKey);
        assertEq(retrieved.upProbabilityBps, 6420);
        assertEq(retrieved.capitalSkewBps, 2840);
        assertEq(retrieved.confidenceScore, 87);
        assertEq(retrieved.openInterestUsd, 182430);

        // Test symbol lookup
        ISentimentPublisher.MarketSignal memory bySymbol = publisher.getSignalBySymbol("BTC");
        assertEq(bySymbol.upProbabilityBps, 6420);
    }

    function test_PublishSignal_Unauthorized() public {
        ISentimentPublisher.MarketSignal memory signal = ISentimentPublisher.MarketSignal({
            upProbabilityBps: 5000,
            capitalSkewBps: 0,
            confidenceScore: 50,
            velocityBpsPerMin: 0,
            accelerationBpsPerMin2: 0,
            timestamp: uint64(block.timestamp),
            openInterestUsd: 1000,
            totalVolumeUsd: 500,
            activeWindowCount: 1
        });

        vm.prank(unauthorizedUser);
        vm.expectRevert(abi.encodeWithSelector(SentimentPublisher.Unauthorized.selector, unauthorizedUser));
        publisher.publishSignal(btcKey, signal);
    }

    function test_PublishSignal_InvalidProbability_Reverts() public {
        ISentimentPublisher.MarketSignal memory signal = ISentimentPublisher.MarketSignal({
            upProbabilityBps: 10001, // > 10000 bps
            capitalSkewBps: 0,
            confidenceScore: 50,
            velocityBpsPerMin: 0,
            accelerationBpsPerMin2: 0,
            timestamp: uint64(block.timestamp),
            openInterestUsd: 1000,
            totalVolumeUsd: 500,
            activeWindowCount: 1
        });

        vm.prank(publisherAgent);
        vm.expectRevert(abi.encodeWithSelector(CrowdSignalLib.InvalidProbabilityBps.selector, 10001));
        publisher.publishSignal(btcKey, signal);
    }

    function test_PublishSignal_InvalidSkew_Reverts() public {
        ISentimentPublisher.MarketSignal memory signal = ISentimentPublisher.MarketSignal({
            upProbabilityBps: 5000,
            capitalSkewBps: 10001, // > 10000 bps
            confidenceScore: 50,
            velocityBpsPerMin: 0,
            accelerationBpsPerMin2: 0,
            timestamp: uint64(block.timestamp),
            openInterestUsd: 1000,
            totalVolumeUsd: 500,
            activeWindowCount: 1
        });

        vm.prank(publisherAgent);
        vm.expectRevert(abi.encodeWithSelector(CrowdSignalLib.InvalidSkewBps.selector, 10001));
        publisher.publishSignal(btcKey, signal);
    }

    function test_PublishSignal_InvalidConfidence_Reverts() public {
        ISentimentPublisher.MarketSignal memory signal = ISentimentPublisher.MarketSignal({
            upProbabilityBps: 5000,
            capitalSkewBps: 0,
            confidenceScore: 101, // > 100
            velocityBpsPerMin: 0,
            accelerationBpsPerMin2: 0,
            timestamp: uint64(block.timestamp),
            openInterestUsd: 1000,
            totalVolumeUsd: 500,
            activeWindowCount: 1
        });

        vm.prank(publisherAgent);
        vm.expectRevert(abi.encodeWithSelector(CrowdSignalLib.InvalidConfidenceScore.selector, 101));
        publisher.publishSignal(btcKey, signal);
    }

    function test_PublishSignalBatch_Success() public {
        bytes32[] memory keys = new bytes32[](2);
        keys[0] = btcKey;
        keys[1] = ethKey;

        ISentimentPublisher.MarketSignal[] memory signals = new ISentimentPublisher.MarketSignal[](2);
        signals[0] = ISentimentPublisher.MarketSignal({
            upProbabilityBps: 6420,
            capitalSkewBps: 2840,
            confidenceScore: 87,
            velocityBpsPerMin: 720,
            accelerationBpsPerMin2: 0,
            timestamp: uint64(block.timestamp),
            openInterestUsd: 182430,
            totalVolumeUsd: 91220,
            activeWindowCount: 4
        });
        signals[1] = ISentimentPublisher.MarketSignal({
            upProbabilityBps: 5870,
            capitalSkewBps: 1210,
            confidenceScore: 82,
            velocityBpsPerMin: 310,
            accelerationBpsPerMin2: 0,
            timestamp: uint64(block.timestamp),
            openInterestUsd: 95400,
            totalVolumeUsd: 48000,
            activeWindowCount: 2
        });

        vm.prank(publisherAgent);
        publisher.publishSignalBatch(keys, signals);

        assertEq(publisher.getSignal(btcKey).upProbabilityBps, 6420);
        assertEq(publisher.getSignal(ethKey).upProbabilityBps, 5870);
        assertEq(publisher.getSupportedAssets().length, 2);
    }

    function testFuzz_PublishSignal(uint16 prob, int16 skew, uint16 confidence) public {
        vm.assume(prob <= 10000);
        vm.assume(skew >= -10000 && skew <= 10000);
        vm.assume(confidence <= 100);

        ISentimentPublisher.MarketSignal memory signal = ISentimentPublisher.MarketSignal({
            upProbabilityBps: prob,
            capitalSkewBps: skew,
            confidenceScore: confidence,
            velocityBpsPerMin: 0,
            accelerationBpsPerMin2: 0,
            timestamp: uint64(block.timestamp),
            openInterestUsd: 10000,
            totalVolumeUsd: 5000,
            activeWindowCount: 1
        });

        vm.prank(publisherAgent);
        publisher.publishSignal(btcKey, signal);

        ISentimentPublisher.MarketSignal memory result = publisher.getSignal(btcKey);
        assertEq(result.upProbabilityBps, prob);
        assertEq(result.capitalSkewBps, skew);
        assertEq(result.confidenceScore, confidence);
    }
}

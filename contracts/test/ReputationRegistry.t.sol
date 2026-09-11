// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { ReputationRegistry } from "../src/ReputationRegistry.sol";
import { IReputationRegistry } from "../src/interfaces/IReputationRegistry.sol";
import { CrowdSignalLib } from "../src/libraries/CrowdSignalLib.sol";

contract ReputationRegistryTest is Test {
    ReputationRegistry public registry;
    address public owner = address(0x1);
    address public admin = address(0x2);
    address public trader1 = address(0x10);
    address public trader2 = address(0x20);

    function setUp() public {
        vm.prank(owner);
        registry = new ReputationRegistry(admin);
    }

    function test_InitialState() public view {
        assertEq(registry.owner(), owner);
        assertEq(registry.registryAdmin(), admin);
        assertEq(registry.getKnownPredictorCount(), 0);
    }

    function test_UpdateReputation_Success() public {
        IReputationRegistry.PredictorReputation memory rep = IReputationRegistry.PredictorReputation({
            totalPredictions: 247,
            resolvedPredictions: 231,
            correctPredictions: 165,
            predictorScore: 91,           // 91/100
            accuracyBps: 7140,            // 71.40%
            calibrationScore: 89,         // 89/100
            consistencyScore: 82,         // 82/100
            currentStreak: 6,
            maxStreak: 14,
            lastActiveTimestamp: uint64(block.timestamp)
        });

        vm.prank(admin);
        registry.updateReputation(trader1, rep);

        IReputationRegistry.PredictorReputation memory retrieved = registry.getReputation(trader1);
        assertEq(retrieved.totalPredictions, 247);
        assertEq(retrieved.resolvedPredictions, 231);
        assertEq(retrieved.predictorScore, 91);
        assertEq(retrieved.accuracyBps, 7140);
        assertTrue(registry.isVerifiedPredictor(trader1));
        assertEq(registry.getKnownPredictorCount(), 1);
    }

    function test_UnverifiedPredictor_DueToLowSampleSize() public {
        // Lucky trader with 2 predictions, 100% win rate
        IReputationRegistry.PredictorReputation memory rep = IReputationRegistry.PredictorReputation({
            totalPredictions: 2,
            resolvedPredictions: 2,
            correctPredictions: 2,
            predictorScore: 45, // Sample-size penalized score
            accuracyBps: 10000,
            calibrationScore: 50,
            consistencyScore: 40,
            currentStreak: 2,
            maxStreak: 2,
            lastActiveTimestamp: uint64(block.timestamp)
        });

        vm.prank(admin);
        registry.updateReputation(trader2, rep);

        // Trader has < 10 resolved predictions and < 60 score, so NOT verified
        assertFalse(registry.isVerifiedPredictor(trader2));
    }

    function test_UpdateReputation_Unauthorized() public {
        IReputationRegistry.PredictorReputation memory rep = IReputationRegistry.PredictorReputation({
            totalPredictions: 10,
            resolvedPredictions: 10,
            correctPredictions: 8,
            predictorScore: 80,
            accuracyBps: 8000,
            calibrationScore: 80,
            consistencyScore: 80,
            currentStreak: 3,
            maxStreak: 5,
            lastActiveTimestamp: uint64(block.timestamp)
        });

        vm.prank(trader1);
        vm.expectRevert(abi.encodeWithSelector(ReputationRegistry.Unauthorized.selector, trader1));
        registry.updateReputation(trader1, rep);
    }

    function test_UpdateReputation_InvalidScore_Reverts() public {
        IReputationRegistry.PredictorReputation memory rep = IReputationRegistry.PredictorReputation({
            totalPredictions: 10,
            resolvedPredictions: 10,
            correctPredictions: 8,
            predictorScore: 101, // > 100
            accuracyBps: 8000,
            calibrationScore: 80,
            consistencyScore: 80,
            currentStreak: 3,
            maxStreak: 5,
            lastActiveTimestamp: uint64(block.timestamp)
        });

        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(CrowdSignalLib.InvalidScore.selector, 101));
        registry.updateReputation(trader1, rep);
    }

    function test_Pagination_Success() public {
        address[] memory traders = new address[](3);
        traders[0] = address(0x101);
        traders[1] = address(0x102);
        traders[2] = address(0x103);

        IReputationRegistry.PredictorReputation[] memory reps = new IReputationRegistry.PredictorReputation[](3);
        for (uint256 i = 0; i < 3; i++) {
            reps[i] = IReputationRegistry.PredictorReputation({
                totalPredictions: 20,
                resolvedPredictions: 20,
                correctPredictions: 15,
                predictorScore: 75,
                accuracyBps: 7500,
                calibrationScore: 75,
                consistencyScore: 75,
                currentStreak: 2,
                maxStreak: 5,
                lastActiveTimestamp: uint64(block.timestamp)
            });
        }

        vm.prank(admin);
        registry.updateReputationBatch(traders, reps);

        assertEq(registry.getKnownPredictorCount(), 3);
        address[] memory page = registry.getKnownPredictors(1, 2);
        assertEq(page.length, 2);
        assertEq(page[0], traders[1]);
        assertEq(page[1], traders[2]);
    }
}

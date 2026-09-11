// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library CrowdSignalLib {
    uint16 internal constant MAX_BPS = 10000;
    int16 internal constant MIN_SKEW_BPS = -10000;
    int16 internal constant MAX_SKEW_BPS = 10000;
    uint16 internal constant MAX_SCORE = 100;

    error InvalidProbabilityBps(uint16 bps);
    error InvalidSkewBps(int16 bps);
    error InvalidConfidenceScore(uint16 score);
    error InvalidScore(uint16 score);

    function toAssetKey(string memory symbol) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(symbol));
    }

    function validateSignal(
        uint16 upProbabilityBps,
        int16 capitalSkewBps,
        uint16 confidenceScore
    ) internal pure {
        if (upProbabilityBps > MAX_BPS) revert InvalidProbabilityBps(upProbabilityBps);
        if (capitalSkewBps < MIN_SKEW_BPS || capitalSkewBps > MAX_SKEW_BPS) revert InvalidSkewBps(capitalSkewBps);
        if (confidenceScore > MAX_SCORE) revert InvalidConfidenceScore(confidenceScore);
    }

    function validateReputation(
        uint16 score,
        uint16 accuracyBps,
        uint16 calibration,
        uint16 consistency
    ) internal pure {
        if (score > MAX_SCORE) revert InvalidScore(score);
        if (accuracyBps > MAX_BPS) revert InvalidProbabilityBps(accuracyBps);
        if (calibration > MAX_SCORE) revert InvalidScore(calibration);
        if (consistency > MAX_SCORE) revert InvalidScore(consistency);
    }
}

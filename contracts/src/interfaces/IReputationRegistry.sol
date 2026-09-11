// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReputationRegistry {
    struct PredictorReputation {
        uint32 totalPredictions;       // Lifetime predictions recorded
        uint32 resolvedPredictions;    // Predictions evaluated against market outcome
        uint32 correctPredictions;     // Directionally accurate predictions
        uint16 predictorScore;         // Composite Bayesian-Wilson score (0 - 100)
        uint16 accuracyBps;            // Raw win rate in bps (0 - 10000)
        uint16 calibrationScore;       // Probability calibration score (0 - 100)
        uint16 consistencyScore;       // Temporal consistency score (0 - 100)
        uint32 currentStreak;          // Current consecutive wins
        uint32 maxStreak;              // Maximum historical consecutive wins
        uint64 lastActiveTimestamp;    // Timestamp of most recent prediction
    }

    event ReputationUpdated(
        address indexed predictor,
        uint16 predictorScore,
        uint16 accuracyBps,
        uint16 calibrationScore,
        uint32 resolvedPredictions
    );

    event RegistryAdminUpdated(address indexed previousAdmin, address indexed newAdmin);

    function getReputation(address predictor) external view returns (PredictorReputation memory);
    function updateReputation(address predictor, PredictorReputation calldata rep) external;
    function updateReputationBatch(address[] calldata predictors, PredictorReputation[] calldata reps) external;
    function isVerifiedPredictor(address predictor) external view returns (bool);
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISentimentPublisher {
    struct MarketSignal {
        uint16 upProbabilityBps;      // 0 - 10000 basis points (e.g. 6420 = 64.20%)
        int16 capitalSkewBps;         // -10000 to +10000 basis points (e.g. +2840 = +28.40% UP skew)
        uint16 confidenceScore;       // 0 - 100 (e.g. 87 = high confidence)
        int16 velocityBpsPerMin;      // Probability velocity in bps/minute (e.g. +720 = +7.2%/min)
        int16 accelerationBpsPerMin2; // Probability acceleration in bps/min^2
        uint64 timestamp;             // Unix timestamp of calculation
        uint64 openInterestUsd;       // Capital-backed open interest in whole USD (or scaled 1e6)
        uint64 totalVolumeUsd;        // Traded volume in USD
        uint32 activeWindowCount;     // Active trading windows aggregated
    }

    event SignalPublished(
        bytes32 indexed assetKey,
        uint16 upProbabilityBps,
        int16 capitalSkewBps,
        uint16 confidenceScore,
        int16 velocityBpsPerMin,
        uint64 openInterestUsd,
        uint64 timestamp
    );

    event PublisherUpdated(address indexed previousPublisher, address indexed newPublisher);

    function getSignal(bytes32 assetKey) external view returns (MarketSignal memory);
    function getSignalBySymbol(string calldata symbol) external view returns (MarketSignal memory);
    function publishSignal(bytes32 assetKey, MarketSignal calldata signal) external;
    function publishSignalBatch(bytes32[] calldata assetKeys, MarketSignal[] calldata signals) external;
}

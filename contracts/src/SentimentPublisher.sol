// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ISentimentPublisher } from "./interfaces/ISentimentPublisher.sol";
import { CrowdSignalLib } from "./libraries/CrowdSignalLib.sol";

/**
 * @title SentimentPublisher
 * @notice Authoritative on-chain feed for DreamDEX Event Contract crowd probabilities,
 *         capital skew, velocity, and market confidence on Somnia Shannon.
 */
contract SentimentPublisher is ISentimentPublisher {
    using CrowdSignalLib for *;

    address public owner;
    address public publisher;

    // Optional Somnia Reactivity precompile address
    address public constant SOMNIA_REACTIVITY_PRECOMPILE = 0x0000000000000000000000000000000000000100;

    mapping(bytes32 => MarketSignal) private _signals;
    mapping(bytes32 => bool) private _supportedAssets;
    bytes32[] private _assetList;

    error Unauthorized(address caller);
    error ZeroAddress();
    error AssetNotFound(bytes32 assetKey);
    error LengthMismatch();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized(msg.sender);
        _;
    }

    modifier onlyPublisher() {
        if (msg.sender != publisher && msg.sender != owner) revert Unauthorized(msg.sender);
        _;
    }

    constructor(address initialPublisher) {
        if (initialPublisher == address(0)) revert ZeroAddress();
        owner = msg.sender;
        publisher = initialPublisher;
        emit PublisherUpdated(address(0), initialPublisher);
    }

    function setPublisher(address newPublisher) external onlyOwner {
        if (newPublisher == address(0)) revert ZeroAddress();
        address oldPublisher = publisher;
        publisher = newPublisher;
        emit PublisherUpdated(oldPublisher, newPublisher);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }

    function getSignal(bytes32 assetKey) external view override returns (MarketSignal memory) {
        MarketSignal memory sig = _signals[assetKey];
        if (sig.timestamp == 0) revert AssetNotFound(assetKey);
        return sig;
    }

    function getSignalBySymbol(string calldata symbol) external view override returns (MarketSignal memory) {
        bytes32 key = CrowdSignalLib.toAssetKey(symbol);
        return this.getSignal(key);
    }

    function getSupportedAssets() external view returns (bytes32[] memory) {
        return _assetList;
    }

    function hasSignal(bytes32 assetKey) external view returns (bool) {
        return _signals[assetKey].timestamp > 0;
    }

    function publishSignal(bytes32 assetKey, MarketSignal calldata signal) external override onlyPublisher {
        _setSignal(assetKey, signal);
    }

    function publishSignalBatch(
        bytes32[] calldata assetKeys,
        MarketSignal[] calldata signals
    ) external override onlyPublisher {
        if (assetKeys.length != signals.length) revert LengthMismatch();
        for (uint256 i = 0; i < assetKeys.length; i++) {
            _setSignal(assetKeys[i], signals[i]);
        }
    }

    function _setSignal(bytes32 assetKey, MarketSignal calldata signal) internal {
        CrowdSignalLib.validateSignal(
            signal.upProbabilityBps,
            signal.capitalSkewBps,
            signal.confidenceScore
        );

        if (!_supportedAssets[assetKey]) {
            _supportedAssets[assetKey] = true;
            _assetList.push(assetKey);
        }

        _signals[assetKey] = signal;

        emit SignalPublished(
            assetKey,
            signal.upProbabilityBps,
            signal.capitalSkewBps,
            signal.confidenceScore,
            signal.velocityBpsPerMin,
            signal.openInterestUsd,
            signal.timestamp
        );
    }

    mapping(bytes32 => ProvenanceRecord) private _provenance;

    function getProvenance(bytes32 assetKey) external view override returns (ProvenanceRecord memory) {
        return _provenance[assetKey];
    }

    function anchorProvenance(
        bytes32 assetKey,
        bytes32 algorithmVersionHash,
        bytes32 inputSnapshotHash,
        bytes32 signalHash
    ) external override onlyPublisher {
        ProvenanceRecord memory rec = ProvenanceRecord({
            algorithmVersionHash: algorithmVersionHash,
            inputSnapshotHash: inputSnapshotHash,
            signalHash: signalHash,
            timestamp: uint64(block.timestamp)
        });
        _provenance[assetKey] = rec;

        emit ProvenanceAnchored(
            assetKey,
            algorithmVersionHash,
            inputSnapshotHash,
            signalHash,
            uint64(block.timestamp)
        );
    }
}

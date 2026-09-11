// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IReputationRegistry } from "./interfaces/IReputationRegistry.sol";
import { CrowdSignalLib } from "./libraries/CrowdSignalLib.sol";

/**
 * @title ReputationRegistry
 * @notice Maintains verifiable prediction reputation metrics for Event Contract participants on Somnia.
 *         Distinguishes genuine statistical skill from lucky streaks using Wilson sample confidence,
 *         Brier calibration, and streak consistency.
 */
contract ReputationRegistry is IReputationRegistry {
    using CrowdSignalLib for *;

    address public owner;
    address public registryAdmin;

    uint32 public constant MIN_RESOLVED_FOR_VERIFIED = 10;
    uint16 public constant MIN_SCORE_FOR_VERIFIED = 60;

    mapping(address => PredictorReputation) private _reputations;
    address[] private _predictorList;
    mapping(address => bool) private _knownPredictors;

    error Unauthorized(address caller);
    error ZeroAddress();
    error LengthMismatch();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized(msg.sender);
        _;
    }

    modifier onlyAdmin() {
        if (msg.sender != registryAdmin && msg.sender != owner) revert Unauthorized(msg.sender);
        _;
    }

    constructor(address initialAdmin) {
        if (initialAdmin == address(0)) revert ZeroAddress();
        owner = msg.sender;
        registryAdmin = initialAdmin;
        emit RegistryAdminUpdated(address(0), initialAdmin);
    }

    function setRegistryAdmin(address newAdmin) external onlyOwner {
        if (newAdmin == address(0)) revert ZeroAddress();
        address oldAdmin = registryAdmin;
        registryAdmin = newAdmin;
        emit RegistryAdminUpdated(oldAdmin, newAdmin);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }

    function getReputation(address predictor) external view override returns (PredictorReputation memory) {
        return _reputations[predictor];
    }

    function isVerifiedPredictor(address predictor) external view override returns (bool) {
        PredictorReputation memory rep = _reputations[predictor];
        return (rep.resolvedPredictions >= MIN_RESOLVED_FOR_VERIFIED && rep.predictorScore >= MIN_SCORE_FOR_VERIFIED);
    }

    function getKnownPredictorCount() external view returns (uint256) {
        return _predictorList.length;
    }

    function getKnownPredictors(uint256 offset, uint256 limit) external view returns (address[] memory) {
        uint256 total = _predictorList.length;
        if (offset >= total) return new address[](0);

        uint256 count = limit;
        if (offset + count > total) {
            count = total - offset;
        }

        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = _predictorList[offset + i];
        }
        return result;
    }

    function updateReputation(address predictor, PredictorReputation calldata rep) external override onlyAdmin {
        _setReputation(predictor, rep);
    }

    function updateReputationBatch(
        address[] calldata predictors,
        PredictorReputation[] calldata reps
    ) external override onlyAdmin {
        if (predictors.length != reps.length) revert LengthMismatch();
        for (uint256 i = 0; i < predictors.length; i++) {
            _setReputation(predictors[i], reps[i]);
        }
    }

    function _setReputation(address predictor, PredictorReputation calldata rep) internal {
        if (predictor == address(0)) revert ZeroAddress();

        CrowdSignalLib.validateReputation(
            rep.predictorScore,
            rep.accuracyBps,
            rep.calibrationScore,
            rep.consistencyScore
        );

        if (!_knownPredictors[predictor]) {
            _knownPredictors[predictor] = true;
            _predictorList.push(predictor);
        }

        _reputations[predictor] = rep;

        emit ReputationUpdated(
            predictor,
            rep.predictorScore,
            rep.accuracyBps,
            rep.calibrationScore,
            rep.resolvedPredictions
        );
    }
}

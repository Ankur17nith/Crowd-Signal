// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Interface for Somnia Reactivity EventHandler
interface ISomniaEventHandler {
    function onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) external;
}

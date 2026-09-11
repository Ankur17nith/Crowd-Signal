// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { SentimentPublisher } from "../src/SentimentPublisher.sol";
import { ReputationRegistry } from "../src/ReputationRegistry.sol";
import { DemoConsumer } from "../src/DemoConsumer.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PUBLISHER_PRIVATE_KEY");

        address deployerAddress = vm.addr(deployerPrivateKey);
        console.log("Deploying CrowdSignal contracts from:", deployerAddress);

        vm.startBroadcast(deployerPrivateKey);

        SentimentPublisher publisher = new SentimentPublisher(deployerAddress);
        console.log("SentimentPublisher deployed to:", address(publisher));

        ReputationRegistry registry = new ReputationRegistry(deployerAddress);
        console.log("ReputationRegistry deployed to:", address(registry));

        DemoConsumer consumer = new DemoConsumer(address(publisher), address(registry));
        console.log("DemoConsumer deployed to:", address(consumer));

        vm.stopBroadcast();
    }
}

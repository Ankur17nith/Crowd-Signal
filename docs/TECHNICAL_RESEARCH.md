# Technical Research & Ecosystem Validation

## 1. Executive Summary

This document records the technical verification of the Somnia Shannon Testnet, DreamDEX Event Contracts, Somnia On-Chain Reactivity precompile, and the developer SDKs. All endpoints, contract addresses, and architectural interfaces documented below have been verified against official DreamDEX and Somnia documentation (`docs.dreamdex.io`, `@somnia-chain/markets-sdk`, and `@somnia-chain/reactivity-contracts`).

---

## 2. Somnia Shannon Testnet Specification

- **Network Name**: Somnia Shannon Testnet
- **EVM Chain ID**: `50312` (`0xC488`)
- **Native Currency**: `STT` (Somnia Test Token - 18 decimals)
- **Public JSON-RPC**: `https://api.infra.testnet.somnia.network/`
- **WebSocket RPC**: `wss://api.infra.testnet.somnia.network/ws`
- **Block Explorer**: `https://shannon-explorer.somnia.network`
- **Testnet Faucet**: `https://testnet.somnia.network` & Google Cloud Web3 Faucet
- **Gas & Finality**: Sub-second finality, 1M+ TPS benchmarked EVM runtime

---

## 3. DreamDEX Event Contracts Architecture

### 3.1 Contract Architecture
DreamDEX is an on-chain Central Limit Order Book (CLOB) DEX on Somnia. Its Event Contracts module provides short-cadence binary outcome prediction markets ("UP" and "DOWN"):
- **Core Deployed Contracts (CREATE3 - Identical on Mainnet & Testnet)**:
  - `BinaryMarketsModule`: `0x3ecC694Cef705358864a646142ac17A90E29e388` (Registry, routes complete-set mints/merges and redemptions)
  - `MarketsCore`: `0x2802504314685D89bF6C992CA5a8e7cC78bc0294`
  - `BinarySettlement`: `0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23`
  - `OutcomeToken6909`: `0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9` (ERC-6909 singleton: UP and DOWN positions are token IDs, not separate ERC-20s)
  - `OracleHub`: `0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b`
  - `CollateralRouter`: `0xbC0C9834B15ACE38bB50dDaa7d7f7C7CC4DC183C`

### 3.2 Collateral Differences
- **Mainnet**: `USDso` (`0x00000022dA000002656c64D9eA6011ea952D008A`) — 18 decimals
- **Testnet (Shannon)**: `tUSDC` (`0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`) — 6 decimals
- **Scaling Rule**: Scale quantities and quote volume dynamically using the collateral contract's `decimals()` rather than hardcoded 1e18 or 1e6 constants.

### 3.3 Market Lifecycle & Status Enum
```
Listed (0) -> Trading (1) -> Locked (2) -> Resolved (4) | Voided (5)
```
- **Listed (0)**: Initialized, not open yet.
- **Trading (1)**: Active trading window, orders accepted, mint/merge of complete sets live.
- **Locked (2)**: Window expired, awaiting oracle settlement price.
- **Resolved (4)**: Winning outcome fixed; winners redeem 1 unit collateral per contract.
- **Voided (5)**: Stale or unresolvable market; both sides redeem at 0.5.

### 3.4 Order Book & Pricing Dynamics
- Single book quoted in UP terms: `Price_UP in (0, 1)`. `Price_DOWN = 1 - Price_UP`.
- Crossing paths:
  1. Buy UP x Sell UP: direct swap
  2. Buy DOWN x Sell DOWN: direct swap
  3. Buy UP x Buy DOWN: **mint-a-pair** (both commit collateral, contract mints fresh pair)
  4. Sell UP x Sell DOWN: **burn-a-pair** (both positions burn, collateral returned)
- Prices represent directly the market-implied UP probability.

---

## 4. Somnia On-Chain Reactivity

### 4.1 Reactivity Precompile
- Address: `0x0000000000000000000000000000000000000100` (`0x0100`)
- Mechanism: Native on-chain event subscription and automated execution. When an event fires on-chain matching a registered subscription topic and emitter, Somnia validators automatically invoke the callback on the handler contract in the next block.

### 4.2 Handler Contract Standard (`SomniaEventHandler`)
```solidity
abstract contract SomniaEventHandler {
    address constant REACTIVITY_PRECOMPILE = 0x0000000000000000000000000000000000000100;

    modifier onlyReactivityPrecompile() {
        require(msg.sender == REACTIVITY_PRECOMPILE, "Unauthorized caller");
        _;
    }

    function onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) external onlyReactivityPrecompile {
        _onEvent(emitter, eventTopics, data);
    }

    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal virtual;
}
```

---

## 5. Developer APIs & Ingestion Endpoints

### 5.1 Endpoints
- **DreamDEX Testnet Indexer GraphQL**: `https://dev.smk.somnia.host/v1/graphql`
- **DreamDEX Mainnet Indexer GraphQL**: `https://prd.smk.somnia.host/v1/graphql`
- **DreamDEX Staging REST API**: `https://stg.api.dreamdex.io/v0`
- **DreamDEX Production REST API**: `https://api.dreamdex.io/v0`
- **Oracle Resolution Explorer**: `https://prd.oracle.somnia.host/questions/{oracleQuestionId}?view=graph`

### 5.2 TypeScript SDK Surface (`@somnia-chain/markets-sdk`)
- `SomniaMarkets`: Unified client instance connecting to indexer GraphQL and WebSocket RPC.
- `listLiveBinaryMarkets()`: Enumerates open binary contract windows.
- `listBinaryMarkets({ status: "Finalized" })`: Queries historical and settled windows.
- `fetchOrderBook(symbol, depth)`: Reads top of book and implied probabilities.
- `getMarketOnchain(marketId)`: Truth read directly from `BinaryMarketsModule`.

---

## 6. Real vs. Simulated Handling Strategy

To adhere strictly to the rule: **"NEVER silently replace real functionality with fake data"**:
1. **Live Mode (Default)**: Connects to Somnia Shannon testnet (`50312`), reads on-chain state (`BinaryMarketsModule`, `SentimentPublisher`, `ReputationRegistry`), and queries the live DreamDEX indexer for active BTC/ETH event contracts.
2. **Demo Mode (Explicitly Labeled)**: If testnet market cadence has no active trades in a given moment, users can toggle `DEMO MODE` with a prominent badge, demonstrating high-velocity probability shifting, streak tracking, and divergence animations using synthetic deterministic cycles.
3. **Graceful Fallback**: If the public testnet indexer is undergoing maintenance, the UI displays `● DATA DELAYED / RECONNECTING` with exact block timestamps and RPC fallbacks.

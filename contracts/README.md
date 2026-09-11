# CrowdSignal Smart Contracts

Authoritative on-chain event intelligence and predictor reputation layer for Somnia Shannon testnet (`50312`).

## Architecture

1. **`SentimentPublisher.sol`**:
   - Stores capital-backed implied probability, directional skew, velocity, acceleration, and confidence scores for active DreamDEX Event Contract markets.
   - Provides gas-efficient single and batch updates for high-cadence market windows.
   - Emits structured `SignalPublished` events for downstream protocol indexers and Somnia Reactivity event subscribers.

2. **`ReputationRegistry.sol`**:
   - Stores statistically validated prediction credentials per wallet address.
   - Uses Wilson score interval ranking, Brier score calibration, and temporal consistency scoring rather than raw PnL.
   - Enforces minimum sample sizes before granting `isVerifiedPredictor` status.

3. **`DemoConsumer.sol`**:
   - Example DeFi/DAO consumer smart contract reading `SentimentPublisher` and `ReputationRegistry`.
   - Automatically detects market regimes (`BULLISH_SURGE`, `BEARISH_RETREAT`, `HIGH_VOLATILITY_ALERT`) and switches defensive guard modes.

## Compiling & Testing

```bash
# Build contracts
forge build

# Run unit and fuzz tests
forge test -vvv
```

## Deployment

Deploy to Somnia Shannon Testnet (`50312`):

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://api.infra.testnet.somnia.network/ \
  --broadcast
```

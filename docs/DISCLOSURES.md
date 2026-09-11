# Security Disclosures, Trust Assumptions & Limitations

## 1. Hackathon Prototype Scope
CrowdSignal is a working proof-of-concept developed for the **Somnia × DreamDEX Event Contracts Hackathon on DoraHacks**. 

## 2. Oracle Trust Assumptions
1. **Publisher Role**: In the current hackathon prototype, the `SentimentPublisher.sol` and `ReputationRegistry.sol` contracts permit updates from an authorized publisher address (`onlyPublisher` / `onlyAdmin`). 
2. **Path to Decentralization**: For production mainnet deployment, this role will transition to an MPC threshold signature network or decentralized validator quorum to eliminate single-point-of-failure risks.
3. **Data Integrity**: All raw inputs originate from verifiable DreamDEX Central Limit Order Book events and the Somnia on-chain settlement module (`BinaryMarketsModule`).

## 3. Financial Disclaimer
CrowdSignal is an event intelligence discovery primitive. None of the signals, capital skews, velocity metrics, predictor scores, or divergence indicators constitute financial, investment, or legal advice. Trading Event Contracts involves capital risk.

## 4. Known Ecosystem Limitations
1. **Testnet Liquidity Cycles**: On Somnia Shannon testnet, Event Contract cadence may occasionally experience quiescent trading windows. To allow continuous testing without waiting for sporadic testnet order book crossing, CrowdSignal includes an explicitly labeled **DEMO MODE** simulator toggle that can be manually activated to test high-velocity probability shifting and streak tracking.
2. **OracleHub Question Latency**: While DreamDEX utilizes Somnia On-Chain Reactivity (`0x0100` precompile) for settlement callbacks, network maintenance or indexer catch-ups may introduce minor telemetry delay. The frontend explicitly marks data status as `● DATA DELAYED` if telemetry exceeds freshness thresholds.

# CrowdSignal

> **Live Event Intelligence Oracle + Verifiable Prediction Reputation Layer for DreamDEX Event Contracts on Somnia.**

Built for the **Somnia × DreamDEX Event Contracts Hackathon on DoraHacks**.

---

## 1. Executive Summary & Core Thesis

DreamDEX Event Contracts generate a continuous, capital-backed signal regarding short-term collective market expectations (e.g. BTC Up 64.2%, Down 35.8%).

In standard prediction markets, this signal is locked inside a single trading UI and disappears the instant a contract settles. Furthermore, leaderboards rank users by raw PnL, conflating lucky 2-win streaks with genuine predictive skill.

**CrowdSignal transforms Event Contract trading into a reusable public intelligence primitive:**

```text
DreamDEX Event Contracts
        ↓
Raw trading & order book activity
        ↓
Crowd Intelligence + Predictor Reputation
        ↓
Verifiable Event Intelligence
        ↓
Humans + DAOs + DeFi + AI Agents + Games + External Smart Contracts
```

---

## 2. Core Pillars

### Pillar A: Crowd Intelligence / Crowd Probability Oracle
- **Implied Probability**: Mid-market probability extracted directly from the touch book.
- **Capital Skew**: Directional capital commitment imbalance `(OI_UP - OI_DOWN) / Total_OI`.
- **Probability Velocity & Acceleration**: Real-time rolling momentum ($d(\text{prob})/dt$).
- **Market Confidence Score (0–100)**: Multi-factor statistical scoring across liquidity depth, bid-ask spread tightness, open interest magnitude, and update recency.

### Pillar B: Verifiable Predictor Reputation (Anti-Gaming)
- **Never ranked by raw win rate or PnL alone**: A lucky trader with 2/2 wins is mathematically penalized compared to a veteran predictor with 165/231 wins.
- **Wilson Score Interval Lower Bound**: Rigorous binomial statistical confidence ($z = 1.96$).
- **Brier Score Calibration**: Measures whether stated confidence corresponds to actual realized binary outcomes (e.g., 70% confidence calls yielding ~69% actual win rate).
- **Streak & Consistency Scoring**: Measures temporal stability across rolling windows.

### Pillar C: Public Developer Consumption Layer
- **On-Chain Feed (`SentimentPublisher.sol`)**: Single-line Solidity integration for any protocol on Somnia.
- **Verifiable Registry (`ReputationRegistry.sol`)**: On-chain verification of trader prediction credentials.
- **External Consumer Demo (`DemoConsumer.sol`)**: Live composable contract demonstrating autonomous regime detection and automated defensive re-allocation.
- **REST APIs**: Public JSON endpoints for off-chain bots and AI agents (`/api/probability`, `/api/reputation`, `/api/divergence`, `/api/markets`).

---

## 3. Verified Ecosystem Specifications

| Component | Target Value |
| :--- | :--- |
| **Network** | Somnia Shannon Testnet |
| **Chain ID** | `50312` (`0xC488`) |
| **Public JSON-RPC** | `https://api.infra.testnet.somnia.network/` |
| **Explorer** | [https://shannon-explorer.somnia.network](https://shannon-explorer.somnia.network) |
| **Reactivity Precompile** | `0x0000000000000000000000000000000000000100` (`0x0100`) |
| **DreamDEX BinaryMarketsModule** | `0x3ecC694Cef705358864a646142ac17A90E29e388` |
| **DreamDEX OutcomeToken6909** | `0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9` |
| **Testnet Collateral Token** | `tUSDC` (`0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E` - 6 decimals) |

---

## 4. Repository Structure

```text
crowdsignal/
├── contracts/                     # Solidity smart contract suite (Foundry)
│   ├── src/
│   │   ├── SentimentPublisher.sol # Core on-chain oracle feed
│   │   ├── ReputationRegistry.sol # Verifiable trader reputation registry
│   │   ├── DemoConsumer.sol       # Composable external consumer demo contract
│   │   ├── interfaces/            # ISentimentPublisher, IReputationRegistry, ISomniaEventHandler
│   │   └── libraries/             # CrowdSignalLib numerical normalization
│   ├── test/                      # Comprehensive unit and fuzz tests (17 passed)
│   ├── script/                    # Deployment scripts (Deploy.s.sol)
│   └── foundry.toml
│
├── indexer/                       # TypeScript Ingestion & Scoring Engine
│   ├── src/
│   │   ├── ingest/                # DreamDEX GraphQL & RPC event ingestor
│   │   ├── scoring/               # Deterministic scoring (crowd, reputation, divergence)
│   │   ├── publisher/             # On-chain Viem transaction publisher
│   │   ├── db/                    # Persistent historical store
│   │   └── index.ts               # Orchestrator daemon
│   └── tests/                     # Vitest test suite (Wilson & Brier calibration)
│
├── web/                           # Next.js 15 App Router Terminal Frontend
│   ├── app/                       # Overview, Markets, Market Detail, Leaderboard, Trader Dossier, Developers, Docs
│   ├── components/                # Terminal-grade UI components, probability charts, calibration curves
│   └── lib/                       # Somnia Shannon Wagmi/Viem configuration and data models
│
├── docs/                          # Exhaustive Technical & Evaluation Documentation
│   ├── TECHNICAL_RESEARCH.md      # Verified ecosystem endpoints & specs
│   ├── ARCHITECTURE.md            # Data pipeline, oracle trust model, reactivity
│   ├── DATA_MODEL.md              # Smart contract structs & database models
│   ├── SCORING.md                 # Statistical algorithms, formulas & anti-gaming
│   ├── DEMO_SCRIPT.md             # 3-5 minute presentation script for judges
│   └── DISCLOSURES.md             # Security disclosures & trust assumptions
│
├── .env.example                   # Environment configuration template
└── README.md
```

---

## 5. Quickstart & Local Development

### Prerequisites
- Node.js v20+ / v24+
- Foundry (`forge` / `cast`)
- Git

### 1. Smart Contracts

```bash
cd contracts

# Build contracts
forge build

# Run unit and fuzz tests (all 17 tests pass with 256 fuzz runs)
forge test -vvv

# Deploy to Somnia Shannon Testnet
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://api.infra.testnet.somnia.network/ \
  --broadcast
```

### Quick Run (From Project Root)

```bash
# Run web terminal directly from root
npm run dev

# Run indexer tests from root
npm test
```

### 2. Indexer & Scoring Engine

```bash
cd indexer

# Install dependencies
npm install

# Run scoring and calibration tests
npm test

# Build & run indexer daemon
npm run build
npm start
```

### 3. Web Terminal Frontend

```bash
cd web

# Install dependencies
npm install

# Run development server
npm run dev

# Or build production bundle
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to access the CrowdSignal Terminal.

---

## 6. Real vs. Simulated Handling Strategy

In strict adherence to hackathon integrity rules: **we never silently substitute fake data for real functionality**.

1. **Default Live Mode**: Connects directly to Somnia Shannon testnet (`50312`), reads on-chain state from `BinaryMarketsModule`, and streams live order books from the DreamDEX indexer.
2. **Explicit Demo Mode**: Because testnet markets may have periods of low transaction frequency, users and judges can toggle the **`DEMO MODE ACTIVE`** button in the header. This explicitly triggers a controlled sequence simulating rapid probability transitions ($42\% \rightarrow 48\% \rightarrow 57\% \rightarrow 64.2\%$) and streak updates, clearly identified with an ambient warning banner.

---

## 7. Submission Checklist & Verification

- [x] Tested against Somnia Shannon testnet (`50312`)
- [x] Verified against official DreamDEX documentation (`docs.dreamdex.io`)
- [x] Somnia Reactivity Precompile (`0x0100`) verified and integrated
- [x] Smart contracts compiled and validated with Foundry fuzz tests
- [x] Anti-gaming Wilson interval and Brier calibration proven
- [x] Next.js 15 App Router production build validated
- [x] External protocol consumer demonstration contract tested
- [x] Demo presentation script and disclosures completed

---

## 8. License

MIT License. See [LICENSE](LICENSE) for details.

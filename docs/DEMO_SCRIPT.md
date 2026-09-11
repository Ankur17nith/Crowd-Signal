# CrowdSignal Hackathon Demo Script (3–5 Minutes)

Use this script for the project video recording and live judge presentations for the **Somnia × DreamDEX Event Contracts Hackathon on DoraHacks**.

---

### Phase 1: The Problem & The Thesis (0:00 – 0:45)
**Screen: Open CrowdSignal Landing Page (`/`)**
> *"Judges, welcome to CrowdSignal. DreamDEX is pioneering high-speed Central Limit Order Book Event Contracts on Somnia. When traders bet Up or Down on BTC or ETH, they lock real capital into a directional belief.*
>
> *However, in traditional prediction markets, this signal lives and dies inside the trading interface. Once a 15-minute window settles, that information vanishes. Furthermore, you cannot tell if a winner was truly skilled or just lucky.*
>
> *CrowdSignal is the intelligence layer built on top of Event Contracts. We turn capital-backed market participation into live, verifiable crowd intelligence and statistical predictor reputation that any human, DAO, DeFi protocol, or AI agent can consume."*

---

### Phase 2: Live Crowd Signal & Flagship Divergence (0:45 – 1:30)
**Screen: Live Crowd Signal & Divergence Gauge (`/`)**
> *"Here on the terminal overview, you see our central Live Crowd Signal for BTC. It is not an AI price prediction; it is the capital-weighted truth of the DreamDEX order book: 64.2% UP, +28.4% capital skew, with high liquidity confidence (87/100) and positive momentum.*
>
> *Directly below is our flagship differentiator: **Crowd vs. Verified Predictors**. Notice that while the general crowd is 64% bullish, our verified predictors consensus is at only 48% UP—a 16% divergence! CrowdSignal immediately highlights that the retail crowd is significantly more bullish than historically accurate predictors."*

---

### Phase 3: Market Detail & State Persistence (1:30 – 2:15)
**Screen: Click "View BTC Signal" -> Navigate to `/market/btc-15m-01`**
> *"Let's drill down into an active 15-minute event window. Here, users and bots inspect contract dynamics in real time: probability momentum at +8.2%/minute, market confidence breakdown across liquidity depth, spread, and participation.*
>
> *With our interactive chart toggles, we can switch from Implied Probability to Open Interest, Volume, and Capital Skew without page reload.*
>
> *Notice our Crowd Sentiment History: 10:00 Bullish, 10:15 Bearish, 10:25 Bullish. CrowdSignal persists intelligence permanently instead of letting it disappear upon settlement."*

---

### Phase 4: Verifiable Reputation & Calibration (2:15 – 3:15)
**Screen: Navigate to Leaderboard (`/leaderboard`) & Click Predictor Profile (`/trader/0x71A...92F`)**
> *"Now let's examine our second pillar: Verifiable Predictor Reputation. We do NOT rank users by raw PnL or win percentage. Notice our #1 ranked predictor: 231 resolved calls with 71.4% accuracy and a 91/100 Predictor Score.*
>
> *Down on row #5, a lucky trader has a 100% win rate from 2 trades. A naive leaderboard would rank them #1. CrowdSignal uses Wilson confidence intervals and penalizes small sample sizes, ranking the veteran higher!*
>
> *Opening the predictor profile, we show the **Calibration Chart**. When this trader states 70% confidence, their actual win rate is ~69%; at 90% confidence, it is ~87%. This mathematically verifies edge rather than luck."*

---

### Phase 5: Wallet & Personal Reputation (3:15 – 3:45)
**Screen: Click "Connect Wallet" -> Open Account Drawer**
> *"When a user connects their wallet, CrowdSignal checks the Somnia `ReputationRegistry.sol` contract. If the wallet has verified calls, their credentials, rank, and calibration appear immediately. If not, the system cleanly informs them: 'Make more resolved Event Contract predictions to establish a statistically meaningful reputation.'"*

---

### Phase 6: Developer Hub & External Contract Consumption (3:45 – 4:30)
**Screen: Navigate to Developers (`/developers`)**
> *"Finally, CrowdSignal is an infrastructure product. Here is our live on-chain feed on Somnia Shannon testnet. Any smart contract can consume our feed with one line of Solidity: `crowdSignal.getSignal(BTC)`.*
>
> *To prove composability, we built and deployed `DemoConsumer.sol`. Here, when BTC probability crosses our 60% threshold, the external contract autonomously detects a `BULLISH_SURGE` regime and adjusts strategy execution in the same block.*
>
> *CrowdSignal turns DreamDEX Event Contracts from an isolated venue into the definitive public intelligence oracle for the entire Somnia ecosystem. Thank you!"*

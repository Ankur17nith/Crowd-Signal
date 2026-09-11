# CrowdSignal Scoring & Methodology Specification

This document details the mathematical algorithms and statistical mechanics powering CrowdSignal.

---

## 1. Crowd Intelligence Algorithms

### 1.1 Implied Probability Aggregation
In DreamDEX Event Contracts, Up and Down trade on a single Central Limit Order Book quoted in Up probability units $p \in (0, 1)$.
For an active window with best bid $b$ and best ask $a$:
$$p_{mid} = \frac{b + a}{2}$$

When multiple trading windows $w_1, w_2, \dots, w_k$ are active for an asset (e.g. 5-minute, 15-minute, 1-hour), they are aggregated by weighting their respective open interest commitments:
$$P_{up} = \frac{\sum_{i=1}^{k} p_{mid, i} \cdot \sqrt{OI_i + 10}}{\sum_{i=1}^{k} \sqrt{OI_i + 10}}$$

### 1.2 Capital Skew (Distinguishing Position from Probability)
Open interest alone is **not** probability. Implied probability is price-derived, while Capital Skew measures directional capital allocation:
$$\text{CapitalSkew} = \frac{OI_{up} - OI_{down}}{OI_{up} + OI_{down} + \epsilon}$$
$$\text{CapitalSkew}_{bps} = \text{clamp}(\text{round}(\text{CapitalSkew} \times 10000), -10000, 10000)$$

Example:
- $P_{up} = 64.2\%$ (implied price)
- Capital Skew $= +28.4\%$ (traders have committed 28.4% more net capital to UP contracts)

### 1.3 Probability Velocity & Acceleration
To capture sudden shifts in market consensus, CrowdSignal computes the time-derivative of probability:
$$v(t) = \frac{P_{up}(t) - P_{up}(t - \Delta t)}{\Delta t_{minutes}}$$
$$a(t) = \frac{v(t) - v(t - \Delta t)}{\Delta t_{minutes}}$$

- **Velocity Thresholds**:
  - $|v| < 2.0\%/\text{min}$: Low Momentum (Stable consensus)
  - $2.0\% \le |v| < 6.0\%/\text{min}$: Medium Momentum
  - $|v| \ge 6.0\%/\text{min}$: High Momentum (Active regime expansion)

### 1.4 Market Confidence Score (0 – 100)
Market confidence reflects the statistical robustness of the signal:
$$\text{Confidence} = \min(100, S_{liquidity} + S_{spread} + S_{participation} + S_{freshness})$$
1. **Liquidity Depth ($S_{liquidity}$, 0–30)**: $\min(30, \text{round}(6 \cdot \log_{10}(OI + 1)))$
2. **Spread Tightness ($S_{spread}$, 0–30)**: $\min(30, \max(0, \text{round}((1 - \text{spread}/0.15) \cdot 30)))$
3. **Participation Diversity ($S_{participation}$, 0–25)**: Derived from unique trader count and trade count.
4. **Data Freshness ($S_{freshness}$, 0–15)**: Decreases if latest block update exceeds 30 seconds.

---

## 2. Verifiable Predictor Reputation Algorithms

### 2.1 The Anti-Gaming Principle
Raw profit-and-loss (PnL) or win rate creates dangerous incentives:
- A lucky user with 2 wins from 2 trades (100% win rate) would artificially rank #1 over a professional predictor with 165 wins from 231 trades (71.4% win rate).
- Large whales can buy huge sizes at 99% probability to claim high PnL without genuine predictive edge.

CrowdSignal solves this using **statistical confidence intervals**, **probabilistic calibration**, and **temporal consistency**.

### 2.2 Wilson Score Interval Lower Bound
For sample size $n$ and win count $w$, with observed proportion $\hat{p} = w/n$:
At 95% confidence level ($z = 1.96$):
$$W = \frac{\hat{p} + \frac{z^2}{2n} - z \sqrt{\frac{\hat{p}(1 - \hat{p})}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}$$

**Demonstration**:
- Trader A: 2 wins / 2 calls ($\hat{p} = 1.0$) $\rightarrow W = 0.342$ (Score: ~34)
- Trader B: 165 wins / 231 calls ($\hat{p} = 0.714$) $\rightarrow W = 0.652$ (Score: ~65)
Trader B ranks significantly higher because of statistical sample confidence!

### 2.3 Brier Score Probability Calibration
Measures whether stated or implied confidence matches actual binary resolution:
$$BS = \frac{1}{n} \sum_{i=1}^{n} (c_i - o_i)^2$$
Where $c_i \in [0.5, 1.0]$ is confidence, and $o_i \in \{0, 1\}$ is actual outcome.
$$\text{CalibrationScore} = \text{round}(\max(0, \min(100, (1 - 1.6 \cdot BS) \cdot 100)))$$

### 2.4 Temporal Consistency Score (0 – 100)
Evaluates stability across rolling windows:
- Splits prediction history into sequential rolling subsets of 5 predictions.
- Calculates variance of the subset win rates $\sigma^2$.
$$\text{ConsistencyScore} = \text{round}(\max(20, \min(100, 100 - 200 \cdot \sigma)))$$

### 2.5 Overall Composite Score
$$\text{PredictorScore} = \text{round}(0.50 \cdot (100 \cdot W) + 0.30 \cdot \text{Calibration} + 0.20 \cdot \text{Consistency})$$

---

## 3. Crowd vs. Predictor Divergence

Calculates the difference between the entire market crowd and the top-tier verified predictors:
$$\text{Divergence}_{bps} = |P_{crowd, bps} - P_{verified, bps}|$$

- **Interpretation Logic**:
  - Delta $> +10\%$: *"Crowd is significantly more bullish than historically accurate predictors."*
  - Delta $< -10\%$: *"Crowd is significantly more bearish than verified predictors."*
  - Delta $\le 5\%$: *"High consensus: Crowd and verified predictors are aligned."*

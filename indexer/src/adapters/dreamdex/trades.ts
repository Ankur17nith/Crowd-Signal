import { PublicClient } from "viem";
import { ABIS, DREAMDEX_CONTRACTS, DreamDexClient } from "./client.js";

export interface CanonicalTrade {
  id: string; // txHash:logIndex
  marketId: string;
  txHash: string;
  logIndex: number;
  blockNumber: number;
  timestamp: number;
  trader: `0x${string}`;
  direction: "UP" | "DOWN";
  price: number;
  size: number;
  collateralAmount: number;
  isMaker: boolean;
}

export class DreamDexTradesAdapter {
  private client: DreamDexClient;
  private blockTimestampCache: Map<number, number> = new Map();

  constructor(client?: DreamDexClient) {
    this.client = client || new DreamDexClient();
  }

  private async getBlockTimestamp(pc: PublicClient, blockNumber: bigint): Promise<number> {
    const bNum = Number(blockNumber);
    if (this.blockTimestampCache.has(bNum)) {
      return this.blockTimestampCache.get(bNum)!;
    }
    try {
      const block = await pc.getBlock({ blockNumber });
      const ts = Number(block.timestamp);
      this.blockTimestampCache.set(bNum, ts);
      if (this.blockTimestampCache.size > 2000) {
        const firstKey = this.blockTimestampCache.keys().next().value;
        if (firstKey !== undefined) this.blockTimestampCache.delete(firstKey);
      }
      return ts;
    } catch {
      return Math.floor(Date.now() / 1000);
    }
  }

  /**
   * Fetch real on-chain trade executions between fromBlock and toBlock
   * Prioritizes canonical OrderFilled events, with OrderPlaced as fallback for order presence
   */
  public async fetchTrades(fromBlock: bigint, toBlock: bigint): Promise<CanonicalTrade[]> {
    const pc = this.client.getClient();
    const trades: CanonicalTrade[] = [];

    try {
      // 1. Ingest canonical executed OrderFilled events from MarketsCore
      const fillLogs = await pc.getLogs({
        address: DREAMDEX_CONTRACTS.marketsCore,
        event: ABIS.marketsCore[1], // OrderFilled(bytes32,address,address,uint256,uint256)
        fromBlock,
        toBlock,
      });

      for (const log of fillLogs) {
        const { marketId, maker, taker, price, amount } = (log as any).args;
        if (!marketId || !taker) continue;

        const timestamp = await this.getBlockTimestamp(pc, log.blockNumber);
        const priceNum = Number(price) / 1e6; // tUSDC (6 decimals on testnet)
        const amountNum = Number(amount) / 1e6;
        const collateral = priceNum * amountNum;
        // In binary markets, price in [0, 1] indicates hurdle probability
        const direction: "UP" | "DOWN" = priceNum >= 0.5 ? "UP" : "DOWN";

        // Record taker trade execution
        trades.push({
          id: `${log.transactionHash}:${log.logIndex}:taker`,
          marketId: marketId as string,
          txHash: log.transactionHash,
          logIndex: Number(log.logIndex),
          blockNumber: Number(log.blockNumber),
          timestamp,
          trader: taker as `0x${string}`,
          direction,
          price: priceNum,
          size: amountNum,
          collateralAmount: collateral,
          isMaker: false,
        });

        // Record maker if different
        if (maker && maker !== taker && maker !== "0x0000000000000000000000000000000000000000") {
          trades.push({
            id: `${log.transactionHash}:${log.logIndex}:maker`,
            marketId: marketId as string,
            txHash: log.transactionHash,
            logIndex: Number(log.logIndex),
            blockNumber: Number(log.blockNumber),
            timestamp,
            trader: maker as `0x${string}`,
            direction: direction === "UP" ? "DOWN" : "UP",
            price: 1 - priceNum,
            size: amountNum,
            collateralAmount: (1 - priceNum) * amountNum,
            isMaker: true,
          });
        }
      }

      // 2. If no fills, also query OrderPlaced for liquidity & market discovery
      if (trades.length === 0) {
        const orderLogs = await pc.getLogs({
          address: DREAMDEX_CONTRACTS.marketsCore,
          event: ABIS.marketsCore[0], // OrderPlaced
          fromBlock,
          toBlock,
        });

        for (const log of orderLogs) {
          const { marketId, trader, direction, price, size } = (log as any).args;
          if (!marketId || !trader) continue;

          const timestamp = await this.getBlockTimestamp(pc, log.blockNumber);
          const dirStr = Number(direction) === 0 ? "UP" : "DOWN";
          const priceNum = Number(price) / 1e6;
          const sizeNum = Number(size) / 1e6;
          const collateral = priceNum * sizeNum;

          trades.push({
            id: `${log.transactionHash}:${log.logIndex}`,
            marketId: marketId as string,
            txHash: log.transactionHash,
            logIndex: Number(log.logIndex),
            blockNumber: Number(log.blockNumber),
            timestamp,
            trader: trader as `0x${string}`,
            direction: dirStr,
            price: priceNum,
            size: sizeNum,
            collateralAmount: collateral,
            isMaker: false,
          });
        }
      }
    } catch {
      // Chain block scan timeout or empty range
    }

    return trades;
  }
}


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

  constructor(client?: DreamDexClient) {
    this.client = client || new DreamDexClient();
  }

  /**
   * Fetch real on-chain trade events between fromBlock and toBlock
   */
  public async fetchTrades(fromBlock: bigint, toBlock: bigint): Promise<CanonicalTrade[]> {
    const pc = this.client.getClient();
    const trades: CanonicalTrade[] = [];

    try {
      // 1. Ingest OrderPlaced events from MarketsCore
      const logs = await pc.getLogs({
        address: DREAMDEX_CONTRACTS.marketsCore,
        event: ABIS.marketsCore[0], // OrderPlaced
        fromBlock,
        toBlock,
      });

      for (const log of logs) {
        const { marketId, trader, direction, price, size } = (log as any).args;
        if (!marketId || !trader) continue;

        const dirStr = Number(direction) === 0 ? "UP" : "DOWN";
        const priceNum = Number(price) / 1e6; // tUSDC (6 decimals)
        const sizeNum = Number(size) / 1e6;
        const collateral = priceNum * sizeNum;

        trades.push({
          id: `${log.transactionHash}:${log.logIndex}`,
          marketId: marketId as string,
          txHash: log.transactionHash,
          logIndex: Number(log.logIndex),
          blockNumber: Number(log.blockNumber),
          timestamp: Math.floor(Date.now() / 1000), // Updated via block timestamp if needed
          trader: trader as `0x${string}`,
          direction: dirStr,
          price: priceNum,
          size: sizeNum,
          collateralAmount: collateral,
          isMaker: false,
        });
      }
    } catch {
      // Chain block scan timeout or empty logs
    }

    return trades;
  }
}

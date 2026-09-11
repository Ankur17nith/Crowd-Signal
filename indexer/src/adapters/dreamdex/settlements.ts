import { ABIS, DREAMDEX_CONTRACTS, DreamDexClient } from "./client.js";

export interface CanonicalSettlement {
  marketId: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  winningOutcome: number; // 1 for UP, 0 for DOWN, -1 for VOID
  settlementPrice?: number;
}

export class DreamDexSettlementsAdapter {
  private client: DreamDexClient;

  constructor(client?: DreamDexClient) {
    this.client = client || new DreamDexClient();
  }

  /**
   * Fetch settlement and resolution events between fromBlock and toBlock
   */
  public async fetchSettlements(fromBlock: bigint, toBlock: bigint): Promise<CanonicalSettlement[]> {
    const pc = this.client.getClient();
    const settlements: CanonicalSettlement[] = [];

    try {
      const logs = await pc.getLogs({
        address: DREAMDEX_CONTRACTS.binarySettlement,
        event: ABIS.binarySettlement[0], // MarketResolved
        fromBlock,
        toBlock,
      });

      for (const log of logs) {
        const { marketId, winningOutcome, settlementPrice } = (log as any).args;
        if (!marketId) continue;

        settlements.push({
          marketId: marketId as string,
          txHash: log.transactionHash,
          blockNumber: Number(log.blockNumber),
          timestamp: Math.floor(Date.now() / 1000),
          winningOutcome: Number(winningOutcome),
          settlementPrice: settlementPrice ? Number(settlementPrice) / 1e6 : undefined,
        });
      }
    } catch {
      // Empty or unreachable
    }

    return settlements;
  }
}

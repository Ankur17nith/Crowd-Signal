import { ABIS, DREAMDEX_CONTRACTS, DreamDexClient } from "./client.js";
import { CONFIG } from "../../config/env.js";

export type MarketStatus = "Listed" | "Trading" | "Locked" | "Resolved" | "Voided" | "Unknown";

export interface CanonicalMarket {
  marketId: `0x${string}`;
  asset: string;
  symbol: string;
  intervalSec: number;
  status: MarketStatus;
  expiry: number;
  poolAddress: string;
  collateralAddress: string;
  source: "ONCHAIN" | "GRAPHQL";
}

const STATUS_MAP: Record<number, MarketStatus> = {
  0: "Listed",
  1: "Trading",
  2: "Locked",
  4: "Resolved",
  5: "Voided",
};

export class DreamDexMarketsAdapter {
  private client: DreamDexClient;

  constructor(client?: DreamDexClient) {
    this.client = client || new DreamDexClient();
  }

  /**
   * Fetch active binary markets using canonical Somnia contracts and GraphQL fallback
   */
  public async getMarkets(): Promise<CanonicalMarket[]> {
    // 1. Prefer GraphQL indexer as primary discovery because it contains rich asset metadata
    const graphQLMarkets = await this.fetchGraphQLMarkets();
    if (graphQLMarkets.length > 0) {
      return graphQLMarkets;
    }
    // 2. Fallback to on-chain registry
    return this.fetchOnchainMarkets();
  }

  /**
   * Read markets directly from BinaryMarketsModule on Somnia Shannon
   */
  public async fetchOnchainMarkets(): Promise<CanonicalMarket[]> {
    const pc = this.client.getClient();
    const markets: CanonicalMarket[] = [];

    try {
      const count = await pc.readContract({
        address: DREAMDEX_CONTRACTS.binaryMarketsModule,
        abi: ABIS.binaryMarketsModule,
        functionName: "getMarketCount",
      });

      const total = Math.min(Number(count), 50);
      for (let i = 0; i < total; i++) {
        try {
          const marketId = (await pc.readContract({
            address: DREAMDEX_CONTRACTS.binaryMarketsModule,
            abi: ABIS.binaryMarketsModule,
            functionName: "getMarketId",
            args: [BigInt(i)],
          })) as `0x${string}`;

          const data = (await pc.readContract({
            address: DREAMDEX_CONTRACTS.binaryMarketsModule,
            abi: ABIS.binaryMarketsModule,
            functionName: "markets",
            args: [marketId],
          })) as [string, string, number, bigint, string, bigint];

          const status = STATUS_MAP[Number(data[2])] || "Unknown";
          const expiry = Number(data[3]);
          const poolAddress = data[1];
          const collateralAddress = data[4];

          // Never infer asset from array position index % 4.
          // If contract metadata does not expose asset symbol, designate as UNKNOWN.
          const asset = "UNKNOWN";

          markets.push({
            marketId,
            asset,
            symbol: `${asset}-UPDOWN`,
            intervalSec: 900,
            status,
            expiry,
            poolAddress,
            collateralAddress,
            source: "ONCHAIN",
          });
        } catch {
          // Continue loop
        }
      }
    } catch {
      // Contract count read failed or contracts awaiting initialization
    }

    return markets;
  }

  /**
   * Query DreamDEX GraphQL Indexer
   */
  public async fetchGraphQLMarkets(): Promise<CanonicalMarket[]> {
    try {
      const query = `
        query LiveBinaryMarkets {
          binaryMarkets(where: { status: { _in: ["Trading", "Listed"] } }, limit: 50, order_by: { expiry: asc }) {
            marketId
            asset
            symbol
            intervalSec
            status
            expiry
            poolAddress
            collateralAddress
          }
        }
      `;

      const res = await fetch(CONFIG.indexerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const json: any = await res.json();
        if (json.data && Array.isArray(json.data.binaryMarkets)) {
          return json.data.binaryMarkets.map((m: any): CanonicalMarket => {
            const rawAsset = (m.asset || "").trim().toUpperCase();
            const asset = rawAsset || "UNKNOWN";
            return {
              marketId: m.marketId,
              asset,
              symbol: m.symbol || (asset !== "UNKNOWN" ? `${asset}-UPDOWN` : "UNKNOWN-UPDOWN"),
              intervalSec: Number(m.intervalSec || 900),
              status: m.status || "Trading",
              expiry: Number(m.expiry || 0),
              poolAddress: m.poolAddress || DREAMDEX_CONTRACTS.binaryMarketsModule,
              collateralAddress: m.collateralAddress || DREAMDEX_CONTRACTS.testnetCollateral,
              source: "GRAPHQL",
            };
          });
        }
      }
    } catch {
      // GraphQL offline or inactive
    }
    return [];
  }
}

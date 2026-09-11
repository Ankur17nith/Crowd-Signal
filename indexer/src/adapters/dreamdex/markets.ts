import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from "@somnia-chain/markets-sdk";
import { somniaShannon } from "@somnia-chain/markets-sdk/chains";
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
  yesTokenId?: string;
  noTokenId?: string;
  yesSymbol?: string;
  noSymbol?: string;
  source: "ONCHAIN" | "SDK";
}

export class DreamDexMarketsAdapter {
  private exchange: SomniaMarkets;

  constructor() {
    this.exchange = new SomniaMarkets({
      chain: somniaShannon,
      indexerUrl: CONFIG.indexerUrl,
      wsRpcUrl: CONFIG.wsRpcUrl,
      addresses: SOMNIA_TESTNET_ADDRESSES,
    });
  }

  public getExchange(): SomniaMarkets {
    return this.exchange;
  }

  /**
   * Fetch active binary event contract markets using the official Somnia Markets / DreamDEX SDK
   */
  public async getMarkets(): Promise<CanonicalMarket[]> {
    try {
      const raw = await this.exchange.loadMarkets(true);
      const markets: CanonicalMarket[] = [];

      for (const m of Object.values(raw)) {
        // Filter to binary event contracts
        if (m.type !== "binary" && m.info?.marketType !== "BINARY") continue;

        const info = m.info as any;
        const marketId = (info?.id || info?.marketId || m.id) as `0x${string}`;
        const rawAsset = (info?.asset || m.base || "").trim().toUpperCase();
        
        // Canonical asset symbol extraction: e.g. "ETH-0-11SEP26..." -> "ETH", "BTC-..." -> "BTC"
        let asset = rawAsset;
        if (asset.includes("ETH")) asset = "ETH";
        else if (asset.includes("BTC")) asset = "BTC";
        else if (asset.includes("SOL")) asset = "SOL";
        else if (asset.includes("BOTNAV")) asset = "BOTNAV";
        else if (!asset) asset = "UNKNOWN";

        const yesOutcome = m.outcomes?.find((o: any) => o.label === "YES" || o.index === 0);
        const noOutcome = m.outcomes?.find((o: any) => o.label === "NO" || o.index === 1);

        const statusRaw = info?.status || (m.active ? "Trading" : "Locked");
        const status: MarketStatus =
          statusRaw === "Trading" || statusRaw === "Listed" || statusRaw === "Locked" || statusRaw === "Resolved" || statusRaw === "Voided"
            ? statusRaw
            : "Unknown";

        markets.push({
          marketId,
          asset,
          symbol: m.symbol,
          intervalSec: Number(info?.intervalSec || 900),
          status,
          expiry: Number(info?.expiry || 0),
          poolAddress: info?.poolAddress || (m as any).pool || "",
          collateralAddress: info?.collateral || SOMNIA_TESTNET_ADDRESSES.collateral,
          yesTokenId: info?.yesTokenId ? String(info.yesTokenId) : undefined,
          noTokenId: info?.noTokenId ? String(info.noTokenId) : undefined,
          yesSymbol: yesOutcome?.symbol || `${m.symbol}#YES`,
          noSymbol: noOutcome?.symbol || `${m.symbol}#NO`,
          source: "SDK",
        });
      }

      return markets;
    } catch (err) {
      console.error("[DreamDexMarketsAdapter] Error loading markets from SomniaMarkets SDK:", err);
      return [];
    }
  }
}

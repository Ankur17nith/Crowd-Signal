import { ABIS, DREAMDEX_CONTRACTS, DreamDexClient } from "./client.js";

export interface CanonicalPositionsInfo {
  marketId: string;
  openInterestUsd: number | null; // NULL if unobservable — never fabricated
  upExposureUsd: number | null;
  downExposureUsd: number | null;
  isAvailable: boolean;
  source: "ERC6909_TOTAL_SUPPLY" | "UNAVAILABLE";
}

export class DreamDexPositionsAdapter {
  private client: DreamDexClient;

  constructor(client?: DreamDexClient) {
    this.client = client || new DreamDexClient();
  }

  /**
   * Derive true protocol Open Interest from OutcomeToken6909 singleton contract.
   * If on-chain query fails or returns zero supply, returns isAvailable: false rather than volume substitution.
   */
  public async getOpenInterest(marketId: `0x${string}`, upTokenId?: bigint, downTokenId?: bigint): Promise<CanonicalPositionsInfo> {
    if (!upTokenId || !downTokenId) {
      return {
        marketId,
        openInterestUsd: null,
        upExposureUsd: null,
        downExposureUsd: null,
        isAvailable: false,
        source: "UNAVAILABLE",
      };
    }

    const pc = this.client.getClient();
    try {
      const upSupply = await pc.readContract({
        address: DREAMDEX_CONTRACTS.outcomeToken6909,
        abi: ABIS.outcomeToken6909,
        functionName: "totalSupply",
        args: [upTokenId],
      });

      const downSupply = await pc.readContract({
        address: DREAMDEX_CONTRACTS.outcomeToken6909,
        abi: ABIS.outcomeToken6909,
        functionName: "totalSupply",
        args: [downTokenId],
      });

      const upSupplyNum = Number(upSupply) / 1e6; // 6 decimals tUSDC
      const downSupplyNum = Number(downSupply) / 1e6;
      // In paired binary markets, 1 UP + 1 DOWN = 1 complete set. True OI is the paired outstanding collateral.
      const pairedSupply = Math.min(upSupplyNum, downSupplyNum);

      return {
        marketId,
        openInterestUsd: pairedSupply > 0 ? pairedSupply : null,
        upExposureUsd: upSupplyNum,
        downExposureUsd: downSupplyNum,
        isAvailable: pairedSupply > 0,
        source: "ERC6909_TOTAL_SUPPLY",
      };
    } catch {
      return {
        marketId,
        openInterestUsd: null,
        upExposureUsd: null,
        downExposureUsd: null,
        isAvailable: false,
        source: "UNAVAILABLE",
      };
    }
  }
}

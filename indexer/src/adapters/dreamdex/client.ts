import { createPublicClient, http, parseAbi, PublicClient } from "viem";
import { CONFIG, somniaShannon } from "../../config/env.js";

export const DREAMDEX_CONTRACTS = {
  binaryMarketsModule: "0x3ecC694Cef705358864a646142ac17A90E29e388" as const,
  marketsCore: "0x2802504314685D89bF6C992CA5a8e7cC78bc0294" as const,
  binarySettlement: "0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23" as const,
  outcomeToken6909: "0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9" as const,
  oracleHub: "0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b" as const,
  collateralRouter: "0xbC0C9834B15ACE38bB50dDaa7d7f7C7CC4DC183C" as const,
  testnetCollateral: "0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E" as const, // tUSDC (6 decimals)
};

export const ABIS = {
  binaryMarketsModule: parseAbi([
    "function getMarketCount() external view returns (uint256)",
    "function getMarketId(uint256 index) external view returns (bytes32)",
    "function markets(bytes32 marketId) external view returns (address market, address pool, uint8 status, uint64 expiry, address collateral, uint256 feeRateBps)",
    "event MarketCreated(bytes32 indexed marketId, address indexed creator, uint64 expiry, address collateral)",
    "event MarketStatusChanged(bytes32 indexed marketId, uint8 oldStatus, uint8 newStatus)",
  ]),
  marketsCore: parseAbi([
    "event OrderPlaced(bytes32 indexed marketId, address indexed trader, uint8 direction, uint256 price, uint256 size)",
    "event OrderFilled(bytes32 indexed marketId, address indexed maker, address indexed taker, uint256 price, uint256 amount)",
    "event PairMinted(bytes32 indexed marketId, address indexed account, uint256 amount)",
    "event PairBurned(bytes32 indexed marketId, address indexed account, uint256 amount)",
  ]),
  binarySettlement: parseAbi([
    "event MarketResolved(bytes32 indexed marketId, uint8 winningOutcome, uint256 settlementPrice)",
    "event PayoutRedeemed(bytes32 indexed marketId, address indexed recipient, uint256 amount)",
    "function getSettlement(bytes32 marketId) external view returns (bool resolved, uint8 winningOutcome, uint256 settlementPrice)",
  ]),
  outcomeToken6909: parseAbi([
    "function totalSupply(uint256 id) external view returns (uint256)",
    "function balanceOf(address account, uint256 id) external view returns (uint256)",
    "event Transfer(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 amount)",
  ]),
};

export class DreamDexClient {
  private publicClient: PublicClient;

  constructor(customRpc?: string) {
    this.publicClient = createPublicClient({
      chain: somniaShannon,
      transport: http(customRpc || CONFIG.rpcUrl, {
        retryCount: 3,
        retryDelay: 1000,
        timeout: 10_000,
      }),
    });
  }

  public getClient(): PublicClient {
    return this.publicClient;
  }

  public async verifyConnection(): Promise<{ connected: boolean; blockNumber?: bigint; error?: string }> {
    try {
      const blockNumber = await this.publicClient.getBlockNumber();
      return { connected: true, blockNumber };
    } catch (err: any) {
      return { connected: false, error: err?.message || String(err) };
    }
  }
}

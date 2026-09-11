import dotenv from "dotenv";
import { defineChain } from "viem";
dotenv.config();

export const somniaShannon = defineChain({
  id: 50312,
  name: "Somnia Shannon Testnet",
  nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.infra.testnet.somnia.network/"] },
  },
  blockExplorers: {
    default: { name: "Shannon Explorer", url: "https://shannon-explorer.somnia.network" },
  },
});

export const CONFIG = {
  // Somnia Shannon Testnet Configuration
  chainId: Number(process.env.SOMNIA_CHAIN_ID || "50312"),
  rpcUrl: process.env.SOMNIA_RPC_URL || "https://api.infra.testnet.somnia.network/",
  wsRpcUrl: process.env.SOMNIA_WS_RPC_URL || "wss://api.infra.testnet.somnia.network/ws",
  
  // DreamDEX Endpoints
  indexerUrl: process.env.DREAMDEX_INDEXER_URL || "https://dev.smk.somnia.host/v1/graphql",
  apiUrl: process.env.DREAMDEX_API_URL || "https://stg.api.dreamdex.io/v0",

  // Published Contract Addresses on Somnia
  sentimentPublisherAddress: (process.env.SENTIMENT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  reputationRegistryAddress: (process.env.REPUTATION_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  
  // Signer
  publisherPrivateKey: (process.env.PUBLISHER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") as `0x${string}`,
  
  // Ingestion cadence
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || "3000"),
  publishIntervalMs: Number(process.env.PUBLISH_INTERVAL_MS || "15000"),
};

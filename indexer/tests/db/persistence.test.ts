import { describe, it, expect, beforeEach } from "vitest";
import { DatabaseManager } from "../../src/db/database.js";
import fs from "node:fs";
import path from "node:path";

describe("DatabaseManager & Persistence Engine", () => {
  it("ensures idempotent trade ingestion without duplicates (restart-safety)", () => {
    const db = DatabaseManager.resetInstanceForTesting(":memory:");

    // 1. Create a market
    db.upsertMarket({
      market_id: "btc-15m-test",
      asset: "BTC",
      symbol: "BTC-UPDOWN",
      interval_sec: 900,
      status: "Trading",
      expiry: Math.floor(Date.now() / 1000) + 900,
      pool_address: "0x1111",
      collateral_address: "0x2222",
      created_at_block: 100,
      created_at_timestamp: 1726050000,
      updated_at: 1726050000,
    });

    const trade = {
      id: "0xabc123:0",
      market_id: "btc-15m-test",
      tx_hash: "0xabc123",
      log_index: 0,
      block_number: 101,
      timestamp: 1726050100,
      trader: "0x71A9908C8E645d9441faB8B33Af671239c36892F",
      direction: "UP" as const,
      price: 0.62,
      size: 100,
      collateral_amount: 62,
      is_maker: 0,
    };

    // Insert trade first time
    db.insertTrade(trade);
    expect(db.getTradeCount()).toBe(1);

    // Re-insert exact same trade (simulating indexer re-sync / replay from block)
    db.insertTrade(trade);
    expect(db.getTradeCount()).toBe(1); // Idempotent: Count MUST remain 1!
  });

  it("tracks and resumes from block cursors", () => {
    const db = DatabaseManager.resetInstanceForTesting(":memory:");
    expect(db.getCursor("test_cursor")).toBeNull();

    db.setCursor("test_cursor", 14892020, 1726058000);
    const cursor = db.getCursor("test_cursor");
    expect(cursor).not.toBeNull();
    expect(cursor?.lastBlock).toBe(14892020);
    expect(cursor?.lastTimestamp).toBe(1726058000);
  });

  it("derives predictions from trades and evaluates Brier scores upon settlement", () => {
    const db = DatabaseManager.resetInstanceForTesting(":memory:");

    db.upsertMarket({
      market_id: "btc-15m-res",
      asset: "BTC",
      symbol: "BTC-UPDOWN",
      interval_sec: 900,
      status: "Trading",
      expiry: Math.floor(Date.now() / 1000) + 60,
      pool_address: "0x1111",
      collateral_address: "0x2222",
      created_at_block: 200,
      created_at_timestamp: 1726050000,
      updated_at: 1726050000,
    });

    db.insertTrade({
      id: "0xdef456:1",
      market_id: "btc-15m-res",
      tx_hash: "0xdef456",
      log_index: 1,
      block_number: 201,
      timestamp: 1726050200,
      trader: "0x71A9908C8E645d9441faB8B33Af671239c36892F",
      direction: "UP",
      price: 0.65,
      size: 50,
      collateral_amount: 32.5,
      is_maker: 0,
    });

    const profileBefore = db.getTraderProfile("0x71A9908C8E645d9441faB8B33Af671239c36892F");
    expect(profileBefore.predictions.length).toBe(1);
    expect(profileBefore.predictions[0].outcome).toBe("Pending");

    // Settle market: UP won (1)
    db.recordSettlement("btc-15m-res", "0xsettle999", 205, 1726050900, 1, 0.68);

    const profileAfter = db.getTraderProfile("0x71A9908C8E645d9441faB8B33Af671239c36892F");
    expect(profileAfter.predictions.length).toBe(1);
    expect(profileAfter.predictions[0].outcome).toBe("Correct");
    expect(profileAfter.predictions[0].brier_score).toBeCloseTo(Math.pow(0.65 - 1.0, 2), 4);
    expect(profileAfter.predictions[0].brier_skill_score).toBeGreaterThan(0);
  });
});

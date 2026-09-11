import { useQuery } from "@tanstack/react-query";
import {
  ActiveMarketsResponse,
  DivergenceResponse,
  LeaderboardResponse,
  MarketSignalResponse,
  OverviewAggregateResponse,
  PredictorProfile,
} from "./data";

export function useOverview(asset: string) {
  return useQuery<OverviewAggregateResponse>({
    queryKey: ["overview", asset],
    queryFn: async () => {
      const res = await fetch(`/api/overview?asset=${asset}`);
      if (!res.ok) throw new Error("Failed to fetch overview intelligence");
      return res.json();
    },
    staleTime: 5_000,
    refetchInterval: 6_000,
  });
}

export function useMarketSignal(asset: string) {
  return useQuery<MarketSignalResponse>({
    queryKey: ["signal", asset],
    queryFn: async () => {
      const res = await fetch(`/api/probability?asset=${asset}`);
      if (!res.ok) throw new Error("Failed to fetch market signal");
      return res.json();
    },
    staleTime: 4_000,
    refetchInterval: 5_000,
  });
}

export function useActiveMarkets() {
  return useQuery<ActiveMarketsResponse>({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await fetch("/api/markets");
      if (!res.ok) throw new Error("Failed to fetch active markets");
      return res.json();
    },
    staleTime: 6_000,
    refetchInterval: 10_000,
  });
}

export function useDivergence(asset: string) {
  return useQuery<DivergenceResponse>({
    queryKey: ["divergence", asset],
    queryFn: async () => {
      const res = await fetch(`/api/divergence?asset=${asset}`);
      if (!res.ok) throw new Error("Failed to fetch divergence");
      return res.json();
    },
    staleTime: 6_000,
    refetchInterval: 10_000,
  });
}

export function useLeaderboard() {
  return useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/reputation");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useTraderProfile(address: string) {
  return useQuery<PredictorProfile>({
    queryKey: ["trader", address],
    queryFn: async () => {
      const res = await fetch(`/api/reputation?address=${address}`);
      if (!res.ok) throw new Error("Failed to fetch trader profile");
      return res.json();
    },
    enabled: Boolean(address),
    staleTime: 15_000,
  });
}

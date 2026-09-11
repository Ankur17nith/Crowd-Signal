import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/lib/serverDb";
import { FIXTURE_PREDICTORS } from "@/fixtures/verifiedFixtures";
import { PredictorProfile } from "@/lib/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const searchParams = req.nextUrl.searchParams;
  const address = searchParams.get("address");

  const db = getServerDb();

  // Single trader profile lookup
  if (address) {
    let profile: PredictorProfile | null = null;
    if (db) {
      try {
        const row = db.prepare(`SELECT * FROM reputation_scores WHERE trader = ?`).get(address);
        if (row) {
          const rawPredictions = db.prepare(`
            SELECT p.*, m.asset, m.interval_sec
            FROM predictions p
            JOIN markets m ON p.market_id = m.market_id
            WHERE p.trader = ?
            ORDER BY p.timestamp DESC LIMIT 50
          `).all(address);

          profile = {
            address: row.trader,
            ensOrShort: row.ens_or_short || `${row.trader.slice(0, 6)}...${row.trader.slice(-4)}`,
            predictorScore: row.predictor_score,
            accuracy: row.accuracy,
            totalPredictions: row.total_predictions,
            resolvedPredictions: row.resolved_predictions,
            bayesianAccuracyMean: row.bayesian_accuracy_mean,
            credibleInterval: [row.credible_interval_low, row.credible_interval_high],
            marketRelativeSkill: row.market_relative_skill,
            meanBrierScore: row.mean_brier_score,
            brierDecomposition: {
              reliability: row.reliability,
              resolution: row.resolution,
              uncertainty: row.uncertainty,
            },
            recencyWeightedSkill: row.recency_weighted_skill,
            skillTrend: row.skill_trend,
            calibrationScore: row.calibration_score,
            consistencyScore: row.consistency_score,
            currentStreak: 0,
            maxStreak: 0,
            isVerified: Boolean(row.is_verified),
            rank: row.rank,
            recentForm: Math.round(row.recency_weighted_skill * 100),
            calibrationBuckets: [],
            history: rawPredictions.map((rp: any) => ({
              id: rp.id,
              date: new Date(rp.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              asset: rp.asset,
              window: `${Math.round(rp.interval_sec / 60)}m`,
              prediction: rp.direction,
              confidence: rp.confidence ? Math.round(rp.confidence * 100) : Math.round(rp.market_probability_at_call * 100),
              marketProbabilityAtCall: Math.round(rp.market_probability_at_call * 100),
              brierSkillScore: rp.brier_skill_score ? Number(rp.brier_skill_score.toFixed(2)) : 0,
              outcome: rp.outcome,
            })),
          };
        }
      } catch (err) {
        console.error("[api/reputation] Lookup error:", err);
      }
    }

    if (!profile && process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
      profile = FIXTURE_PREDICTORS.find((p) => p.address.toLowerCase() === address.toLowerCase()) || FIXTURE_PREDICTORS[0];
    }

    if (!profile) {
      return NextResponse.json(
        {
          address,
          status: "Not enough predictor observations",
          message: "No resolved prediction activity recorded for this address on Somnia Shannon.",
          elapsedMs: Date.now() - startTime,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(profile, {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10" },
    });
  }

  // Full Leaderboard lookup
  let predictors: PredictorProfile[] = [];
  if (db) {
    try {
      const rows = db.prepare(`SELECT * FROM reputation_scores ORDER BY rank ASC LIMIT 50`).all();
      if (rows && rows.length > 0) {
        predictors = rows.map((r: any): PredictorProfile => ({
          address: r.trader,
          ensOrShort: r.ens_or_short || `${r.trader.slice(0, 6)}...${r.trader.slice(-4)}`,
          predictorScore: r.predictor_score,
          accuracy: r.accuracy,
          totalPredictions: r.total_predictions,
          resolvedPredictions: r.resolved_predictions,
          bayesianAccuracyMean: r.bayesian_accuracy_mean,
          credibleInterval: [r.credible_interval_low, r.credible_interval_high],
          marketRelativeSkill: r.market_relative_skill,
          meanBrierScore: r.mean_brier_score,
          brierDecomposition: {
            reliability: r.reliability,
            resolution: r.resolution,
            uncertainty: r.uncertainty,
          },
          recencyWeightedSkill: r.recency_weighted_skill,
          skillTrend: r.skill_trend,
          calibrationScore: r.calibration_score,
          consistencyScore: r.consistency_score,
          currentStreak: 0,
          maxStreak: 0,
          isVerified: Boolean(r.is_verified),
          rank: r.rank,
          recentForm: Math.round(r.recency_weighted_skill * 100),
          calibrationBuckets: [],
          history: [],
        }));
      }
    } catch (err) {
      console.error("[api/reputation] Leaderboard error:", err);
    }
  }

  if (predictors.length === 0 && process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    predictors = FIXTURE_PREDICTORS;
  }

  return NextResponse.json(
    {
      predictors,
      count: predictors.length,
      status: predictors.length > 0 ? "LIVE" : "Not enough predictor observations",
      methodology: "CS-REPUTATION-2.0 (Market-Relative Brier Skill & Bayesian Beta-Binomial Shrinkage)",
      elapsedMs: Date.now() - startTime,
    },
    {
      headers: { "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10" },
    }
  );
}

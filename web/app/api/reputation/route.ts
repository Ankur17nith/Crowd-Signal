import { NextResponse } from "next/server";
import { INITIAL_PREDICTORS } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (address) {
    const predictor = INITIAL_PREDICTORS.find(
      (p) => p.address.toLowerCase() === address.toLowerCase()
    );

    if (!predictor) {
      return NextResponse.json(
        {
          error: "Predictor not found",
          message: "No resolved predictions recorded for this address yet.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      address: predictor.address,
      predictorScore: predictor.predictorScore,
      accuracy: predictor.accuracy,
      totalPredictions: predictor.totalPredictions,
      resolvedPredictions: predictor.resolvedPredictions,
      calibrationScore: predictor.calibrationScore,
      consistencyScore: predictor.consistencyScore,
      isVerified: predictor.isVerified,
      calibrationBuckets: predictor.calibrationBuckets,
    });
  }

  // Return all verified predictors
  return NextResponse.json({
    predictors: INITIAL_PREDICTORS.map((p) => ({
      address: p.address,
      predictorScore: p.predictorScore,
      accuracy: p.accuracy,
      totalPredictions: p.totalPredictions,
      resolvedPredictions: p.resolvedPredictions,
      calibrationScore: p.calibrationScore,
      consistencyScore: p.consistencyScore,
      isVerified: p.isVerified,
      rank: p.rank,
    })),
  });
}

import { NextResponse } from "next/server";
import { INITIAL_DIVERGENCE } from "@/lib/data";

export async function GET() {
  return NextResponse.json(INITIAL_DIVERGENCE);
}

import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.NASA_API_KEY ?? "";
  return NextResponse.json({
    isDemo: key === "DEMO_KEY" || key === "",
  });
}

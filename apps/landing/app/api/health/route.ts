import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "landing",
    timestamp: new Date().toISOString(),
  });
}

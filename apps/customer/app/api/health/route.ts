import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "customer",
    timestamp: new Date().toISOString(),
  });
}

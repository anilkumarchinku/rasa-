import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      error: "The resolver worker is disabled for the Saved Reels launch.",
      status: "not_available",
    },
    { status: 410 },
  );
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "Restaurant location matching is not part of the Saved Reels launch.",
      status: "not_available",
    },
    { status: 410 },
  );
}

import { NextRequest, NextResponse } from "next/server";
import {
  anonymousSessionCookieName,
  getAnonymousSession,
  type AnonymousSession,
} from "@/server/anonymous-session";
import { getSessionSigningSecret, getSupabaseAdminConfig } from "@/server/config";
import { isSaveId, parseSavedReel } from "@/server/saved-reels/model";
import { SavedReelsRepository } from "@/server/saved-reels/repository";
import { SavedReelLimitError, SavedReelsService } from "@/server/saved-reels/service";

export const dynamic = "force-dynamic";

type SaveRequest = {
  save?: unknown;
};

function responseWithSession(body: unknown, session: AnonymousSession | null, init?: ResponseInit) {
  const response = NextResponse.json(body, init);

  if (session?.shouldSetCookie) {
    response.cookies.set({
      name: anonymousSessionCookieName,
      value: session.cookieValue,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

function createBackend(request: NextRequest) {
  const config = getSupabaseAdminConfig();
  if (!config) return null;

  const session = getAnonymousSession(
    request.cookies.get(anonymousSessionCookieName)?.value,
    getSessionSigningSecret(config),
  );
  const service = new SavedReelsService(new SavedReelsRepository(config));
  return { service, session };
}

function backendFailure(error: unknown, session: AnonymousSession) {
  if (error instanceof SavedReelLimitError) {
    return responseWithSession({ error: error.message }, session, { status: 429 });
  }

  return responseWithSession({ error: "Rasa could not reach cloud storage." }, session, {
    status: 503,
  });
}

export async function GET(request: NextRequest) {
  const backend = createBackend(request);
  if (!backend) return NextResponse.json({ mode: "local", saves: [] });

  try {
    const saves = await backend.service.list(backend.session.userKey);
    return responseWithSession({ mode: "supabase", saves }, backend.session);
  } catch (error) {
    return backendFailure(error, backend.session);
  }
}

export async function POST(request: NextRequest) {
  let body: SaveRequest;

  try {
    body = (await request.json()) as SaveRequest;
  } catch {
    return NextResponse.json({ error: "Invalid save payload." }, { status: 400 });
  }

  const save = parseSavedReel(body.save);
  if (!save) {
    return NextResponse.json({ error: "Paste a valid Instagram Reel link." }, { status: 400 });
  }

  const backend = createBackend(request);
  if (!backend) return NextResponse.json({ mode: "local" });

  try {
    const savedReel = await backend.service.save(backend.session.userKey, save);
    return responseWithSession({ mode: "supabase", save: savedReel }, backend.session);
  } catch (error) {
    return backendFailure(error, backend.session);
  }
}

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get("id") ?? undefined;
  if (id && !isSaveId(id)) {
    return NextResponse.json({ error: "Invalid saved Reel id." }, { status: 400 });
  }

  const backend = createBackend(request);
  if (!backend) return NextResponse.json({ mode: "local", cleared: true });

  try {
    await backend.service.remove(backend.session.userKey, id);
    return responseWithSession({ mode: "supabase", cleared: true }, backend.session);
  } catch (error) {
    return backendFailure(error, backend.session);
  }
}

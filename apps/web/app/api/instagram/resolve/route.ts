import { NextResponse } from "next/server";
import {
  extractCreatorHandle,
  matchSeedPlace,
  resolveInstagramSaveCandidate,
  type InstagramResolverResult,
} from "@rasa/shared";

type ResolveRequest = {
  url?: string;
};

type MetaOembedResponse = {
  author_name?: string;
  html?: string;
  thumbnail_url?: string;
};

function accessToken() {
  return process.env.META_INSTAGRAM_OEMBED_TOKEN ?? process.env.META_ACCESS_TOKEN;
}

async function resolveWithMetaOembed(url: string): Promise<InstagramResolverResult | null> {
  const token = accessToken();

  if (!token) {
    return null;
  }

  const endpoint = new URL("https://graph.facebook.com/v21.0/instagram_oembed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("fields", "author_name,thumbnail_url,html");
  endpoint.searchParams.set("access_token", token);

  const response = await fetch(endpoint, { next: { revalidate: 3600 } });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as MetaOembedResponse;
  const candidateText = [payload.author_name, payload.html].filter(Boolean).join(" ");
  const place = matchSeedPlace(candidateText);

  if (!place) {
    return {
      status: "pending",
      confidence: 0.35,
      candidateText,
      creatorHandle: payload.author_name ?? extractCreatorHandle(candidateText),
      note: "Meta oEmbed returned metadata, but no restaurant matched yet. Thumbnail OCR/AI review should run next.",
      source: "meta-oembed",
      thumbnailUrl: payload.thumbnail_url,
    };
  }

  return {
    status: "resolved",
    confidence: 0.82,
    candidateText,
    creatorHandle: payload.author_name ?? extractCreatorHandle(candidateText),
    note: "Resolved from Meta oEmbed metadata.",
    place,
    source: "meta-oembed",
    thumbnailUrl: payload.thumbnail_url,
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as ResolveRequest;
  const url = body.url?.trim();

  if (!url) {
    return NextResponse.json(
      {
        status: "pending",
        confidence: 0,
        candidateText: "",
        note: "Missing Instagram URL.",
        source: "unresolved",
      } satisfies InstagramResolverResult,
      { status: 400 },
    );
  }

  const officialResult = await resolveWithMetaOembed(url);

  if (officialResult) {
    return NextResponse.json(officialResult);
  }

  return NextResponse.json(resolveInstagramSaveCandidate(url));
}

import { NextResponse } from "next/server";
import {
  extractCreatorHandle,
  matchSeedPlace,
  resolveInstagramSaveCandidate,
  type InstagramResolverResult,
  type ResolverPipelineStep,
} from "@rasa/shared";

type ResolveRequest = {
  url?: string;
  captionText?: string;
  ocrText?: string;
  thumbnailUrl?: string;
};

type MetaOembedResponse = {
  author_name?: string;
  html?: string;
  thumbnail_url?: string;
};

type AiExtractionResponse = {
  restaurantName?: string;
  area?: string;
  dish?: string;
  creatorHandle?: string;
  confidence?: number;
  evidence?: string;
};

function accessToken() {
  return process.env.META_INSTAGRAM_OEMBED_TOKEN ?? process.env.META_ACCESS_TOKEN;
}

function openAiConfig() {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return null;
  }

  return {
    key,
    model: process.env.OPENAI_RESOLVER_MODEL ?? "gpt-5.4-nano",
  };
}

function htmlToText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pipelineStep(
  id: ResolverPipelineStep["id"],
  label: string,
  status: ResolverPipelineStep["status"],
  detail: string,
): ResolverPipelineStep {
  return { detail, id, label, status };
}

function mergeSteps(...groups: Array<ResolverPipelineStep[] | undefined>) {
  return groups.flatMap((group) => group ?? []);
}

function extractRestaurantNameHeuristic(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const patterns = [
    /\bat\s+([A-Z][A-Za-z0-9&'. -]{2,80}?(?:Hotel|Restaurant|Cafe|Café|Mess|Military Hotel|Bandi|House|Kitchen|Foods|Dhaba))/,
    /\b([A-Z][A-Za-z0-9&'. -]{2,80}?(?:Military Hotel|Hotel|Restaurant|Cafe|Café|Mess|Bandi|House|Kitchen|Foods|Dhaba))\b/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern)?.[1]?.trim();

    if (match) {
      return match.replace(/[.,:;|]+$/g, "").trim();
    }
  }

  return undefined;
}

function resolveWithHeuristicExtraction(input: {
  candidateText: string;
  inheritedSteps?: ResolverPipelineStep[];
  thumbnailUrl?: string;
  url: string;
}): InstagramResolverResult | null {
  const place = matchSeedPlace(input.candidateText);

  if (place) {
    return {
      status: "resolved",
      confidence: 0.84,
      candidateText: input.candidateText,
      creatorHandle: extractCreatorHandle(input.candidateText),
      note: `Resolved from available metadata/OCR text: ${place.name}.`,
      place,
      source: "direct-text",
      thumbnailUrl: input.thumbnailUrl,
      estimatedCostInr: 0,
      steps: mergeSteps(input.inheritedSteps, [
        pipelineStep(
          "place-match",
          "Place match",
          "passed",
          `Metadata/OCR text matched ${place.name}.`,
        ),
      ]),
    };
  }

  const extractedPlaceName = extractRestaurantNameHeuristic(input.candidateText);

  if (!extractedPlaceName) {
    return null;
  }

  return {
    status: "review",
    confidence: 0.58,
    candidateText: input.candidateText,
    creatorHandle: extractCreatorHandle(input.candidateText),
    note: `Detected possible restaurant "${extractedPlaceName}", but it is not verified in Rasa's place database yet. Keeping it in review before adding a map pin.`,
    source: "unresolved",
    thumbnailUrl: input.thumbnailUrl,
    extractedPlaceName,
    estimatedCostInr: 0,
    steps: mergeSteps(input.inheritedSteps, [
      pipelineStep(
        "ocr-ai",
        "Text extraction",
        "needs_review",
        `Heuristic detected ${extractedPlaceName}.`,
      ),
      pipelineStep(
        "review",
        "Human/place verification",
        "needs_review",
        "Needs confirmation before creating a map pin.",
      ),
    ]),
  };
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
  const candidateText = [payload.author_name, payload.html ? htmlToText(payload.html) : undefined]
    .filter(Boolean)
    .join(" ");
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
      estimatedCostInr: 0,
      steps: [
        pipelineStep(
          "meta",
          "Meta oEmbed",
          "passed",
          "Official metadata was fetched, but it did not contain a known Rasa restaurant.",
        ),
      ],
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
    estimatedCostInr: 0,
    steps: [
      pipelineStep(
        "meta",
        "Meta oEmbed",
        "passed",
        "Official metadata contained enough text to match a Rasa seed restaurant.",
      ),
      pipelineStep("place-match", "Place match", "passed", `Matched ${place.name}.`),
    ],
  };
}

async function resolveWithAiExtraction(input: {
  url: string;
  candidateText: string;
  thumbnailUrl?: string;
  inheritedSteps?: ResolverPipelineStep[];
}): Promise<InstagramResolverResult | null> {
  const config = openAiConfig();

  if (!config) {
    return null;
  }

  const content: Array<
    | { type: "input_text"; text: string }
    | { type: "input_image"; image_url: string; detail: "low" | "high" | "auto" }
  > = [
    {
      type: "input_text",
      text: [
        "You are Rasa's dining resolver for Hyderabad restaurant Reels.",
        "Extract restaurant name, area/neighborhood, hero dish, creator handle, and confidence from the provided Instagram metadata/OCR text/image.",
        "Return only strict JSON with keys: restaurantName, area, dish, creatorHandle, confidence, evidence.",
        "If you are not sure, use low confidence. Never invent a restaurant.",
        `Instagram URL: ${input.url}`,
        `Known metadata/OCR text: ${input.candidateText || "none"}`,
      ].join("\n"),
    },
  ];

  if (input.thumbnailUrl) {
    content.push({
      type: "input_image",
      image_url: input.thumbnailUrl,
      detail: "low",
    });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      input: [
        {
          role: "user",
          content,
        },
      ],
      text: {
        format: {
          type: "json_object",
        },
      },
    }),
  });

  if (!response.ok) {
    return {
      status: "pending",
      confidence: 0.25,
      candidateText: input.candidateText,
      note: "AI extraction was configured but failed. Rasa kept this Reel in the resolver queue for retry.",
      source: "unresolved",
      thumbnailUrl: input.thumbnailUrl,
      estimatedCostInr: 1,
      steps: mergeSteps(input.inheritedSteps, [
        pipelineStep(
          "ocr-ai",
          "OCR/AI extraction",
          "failed",
          `OpenAI resolver returned ${response.status}.`,
        ),
      ]),
    };
  }

  const payload = (await response.json()) as { output_text?: string };
  const outputText = payload.output_text ?? "";
  let extraction: AiExtractionResponse = {};

  try {
    extraction = JSON.parse(outputText) as AiExtractionResponse;
  } catch {
    return null;
  }

  const candidateText = [
    input.candidateText,
    extraction.restaurantName,
    extraction.area,
    extraction.dish,
    extraction.creatorHandle ? `@${extraction.creatorHandle}` : undefined,
    extraction.evidence,
  ]
    .filter(Boolean)
    .join(" ");
  const place = matchSeedPlace(candidateText);
  const confidence = Math.max(0.1, Math.min(0.95, extraction.confidence ?? 0.5));
  const extractedName = extraction.restaurantName?.trim();
  const steps = mergeSteps(input.inheritedSteps, [
    pipelineStep(
      "ocr-ai",
      "OCR/AI extraction",
      extractedName ? "passed" : "needs_review",
      extractedName
        ? `AI extracted ${extractedName}${extraction.dish ? ` from ${extraction.dish}` : ""}.`
        : "AI could not confidently extract a restaurant name.",
    ),
  ]);

  if (place && confidence >= 0.78) {
    return {
      status: "resolved",
      confidence,
      candidateText,
      creatorHandle: extraction.creatorHandle ?? extractCreatorHandle(candidateText),
      note: `Resolved by AI extraction and Rasa place match: ${place.name}.`,
      place,
      source: "ai-extraction",
      thumbnailUrl: input.thumbnailUrl,
      extractedPlaceName: extractedName,
      extractedArea: extraction.area,
      extractedDish: extraction.dish,
      estimatedCostInr: 1,
      steps: mergeSteps(steps, [
        pipelineStep("place-match", "Place match", "passed", `Matched ${place.name}.`),
      ]),
    };
  }

  return {
    status: "review",
    confidence,
    candidateText,
    creatorHandle: extraction.creatorHandle ?? extractCreatorHandle(candidateText),
    note: extractedName
      ? `AI found "${extractedName}", but it is not verified in Rasa's place database yet. Keeping it in review before adding a map pin.`
      : "AI could not identify the restaurant with enough confidence. Keeping it in review.",
    source: "ai-extraction",
    thumbnailUrl: input.thumbnailUrl,
    extractedPlaceName: extractedName,
    extractedArea: extraction.area,
    extractedDish: extraction.dish,
    estimatedCostInr: 1,
    steps: mergeSteps(steps, [
      pipelineStep(
        "review",
        "Human/place verification",
        "needs_review",
        "Needs confirmation before creating a map pin.",
      ),
    ]),
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

  if (officialResult?.status === "resolved") {
    return NextResponse.json(officialResult);
  }

  const fallbackResult = resolveInstagramSaveCandidate(url);

  if (fallbackResult.status === "resolved") {
    return NextResponse.json(fallbackResult);
  }

  const candidateText = [body.captionText, body.ocrText, officialResult?.candidateText, url]
    .filter(Boolean)
    .join("\n");
  const heuristicResult = resolveWithHeuristicExtraction({
    url,
    candidateText,
    thumbnailUrl: body.thumbnailUrl ?? officialResult?.thumbnailUrl,
    inheritedSteps: mergeSteps(officialResult?.steps, fallbackResult.steps),
  });

  if (heuristicResult) {
    return NextResponse.json(heuristicResult);
  }

  const aiResult = await resolveWithAiExtraction({
    url,
    candidateText,
    thumbnailUrl: body.thumbnailUrl ?? officialResult?.thumbnailUrl,
    inheritedSteps: mergeSteps(officialResult?.steps, fallbackResult.steps),
  });

  if (aiResult) {
    return NextResponse.json(aiResult);
  }

  return NextResponse.json({
    ...fallbackResult,
    steps: mergeSteps(officialResult?.steps, fallbackResult.steps, [
      pipelineStep(
        "ocr-ai",
        "OCR/AI extraction",
        "skipped",
        "Set OPENAI_API_KEY to enable AI extraction from metadata, OCR text, or thumbnails.",
      ),
    ]),
  });
}

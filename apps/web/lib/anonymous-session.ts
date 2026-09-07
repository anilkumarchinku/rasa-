import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";

const cookieName = "rasa_saved_reels_session";

function signatureFor(userKey: string, secret: string) {
  return createHmac("sha256", secret).update(userKey).digest("base64url");
}

function signaturesMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export type AnonymousSession = {
  cookieValue: string;
  shouldSetCookie: boolean;
  userKey: string;
};

export function getAnonymousSession(
  cookieValue: string | undefined,
  secret: string,
): AnonymousSession {
  if (cookieValue) {
    const [userKey, signature] = cookieValue.split(".");

    if (
      userKey?.startsWith("anon-") &&
      signature &&
      signaturesMatch(signature, signatureFor(userKey, secret))
    ) {
      return { cookieValue, shouldSetCookie: false, userKey };
    }
  }

  const userKey = `anon-${randomUUID()}`;
  const nextCookieValue = `${userKey}.${signatureFor(userKey, secret)}`;

  return { cookieValue: nextCookieValue, shouldSetCookie: true, userKey };
}

export const anonymousSessionCookieName = cookieName;

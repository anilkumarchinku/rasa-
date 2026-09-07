import assert from "node:assert/strict";
import test from "node:test";
import { getAnonymousSession } from "./anonymous-session";

test("a valid signed anonymous session is reused", () => {
  const initial = getAnonymousSession(undefined, "test-signing-secret");
  const reused = getAnonymousSession(initial.cookieValue, "test-signing-secret");

  assert.equal(reused.userKey, initial.userKey);
  assert.equal(reused.shouldSetCookie, false);
});

test("a tampered anonymous session is replaced", () => {
  const initial = getAnonymousSession(undefined, "test-signing-secret");
  const tampered = `${initial.cookieValue}tampered`;
  const replacement = getAnonymousSession(tampered, "test-signing-secret");

  assert.notEqual(replacement.userKey, initial.userKey);
  assert.equal(replacement.shouldSetCookie, true);
});

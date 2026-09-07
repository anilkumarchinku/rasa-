const instagramHosts = new Set(["instagram.com", "www.instagram.com", "m.instagram.com"]);

export function normalizeInstagramReelUrl(value: string) {
  try {
    const url = new URL(value.trim());

    if (
      url.protocol !== "https:" ||
      !instagramHosts.has(url.hostname.toLowerCase()) ||
      !url.pathname.startsWith("/reel/")
    ) {
      return null;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

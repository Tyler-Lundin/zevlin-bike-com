import { NextResponse } from "next/server";

export function GET(): Response {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zevlinbike.com";
  const securityEmail = process.env.LANDING_SECURITY_EMAIL?.trim() || "security@zevlinbike.com";
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const body = [
    `Contact: mailto:${securityEmail}`,
    `Expires: ${expires}`,
    "Preferred-Languages: en",
    `Policy: ${siteUrl}/security`,
    `Canonical: ${siteUrl}/.well-known/security.txt`,
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

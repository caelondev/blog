/// <reference types="@cloudflare/workers-types" />
import { XMLParser } from "fast-xml-parser";

export interface Env {
  ASSETS: Fetcher;
}

const BOT_UA =
  /bot|facebookexternalhit|Twitterbot|Slackbot|Discordbot|LinkedInBot|WhatsApp|TelegramBot|SkypeUriPreview|Pinterest|redditbot/i;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const userAgent = request.headers.get("user-agent") || "";

    const postMatch = url.pathname.match(/^\/posts\/([^/]+)\/?$/);

    if (postMatch && BOT_UA.test(userAgent)) {
      const slug = postMatch[1];

      const rssRes = await fetch("https://blog.caelondev.net/rss.xml");
      if (rssRes.ok) {
        const xml = await rssRes.text();
        const parser = new XMLParser();
        const feed = parser.parse(xml);
        const items = feed?.rss?.channel?.item ?? [];
        const list = Array.isArray(items) ? items : [items];

        const match = list.find((item: any) =>
          item.link?.endsWith(`/posts/${slug}`),
        );

        if (match) {
          const title = String(match.title ?? "");
          const description = String(match.description ?? "");
          const pageUrl = `https://blog.caelondev.net/posts/${slug}`;
          const ogImageUrl = `https://api.caelondev.net/blog/posts/${slug}/og`;

          const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${ogImageUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${pageUrl}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${ogImageUrl}" />
</head>
<body></body>
</html>`;

          return new Response(html, {
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
      }
    }

    return env.ASSETS.fetch(request);
  },
};

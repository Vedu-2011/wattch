import type { MetadataRoute } from "next";

/** Everything is public except the scripted video walk-through and the APIs. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/demo", "/api/"] },
    sitemap: "https://getwattch.vercel.app/sitemap.xml",
  };
}

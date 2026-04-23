const routes = [
  "",
  "/browse",
  "/find-farmers",
  "/international",
  "/request-quote",
  "/buyer-protection",
  "/help",
  "/sell",
  "/mobile",
  "/pricing",
  "/terms",
  "/privacy",
  "/contact",
  "/verification",
  "/trade-support",
  "/inspections-info",
  "/logistics-info",
  "/documentation-info",
];

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://agriculnet.example.com";
  const now = new Date();
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/browse" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/browse" ? 0.9 : 0.7,
  }));
}

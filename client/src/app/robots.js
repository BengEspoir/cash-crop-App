export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://agriculnet.example.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/farmer/", "/buyer/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

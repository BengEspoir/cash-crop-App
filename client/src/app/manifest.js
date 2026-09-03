export default function manifest() {
  return {
    name: "AgriculNet",
    short_name: "AgriculNet",
    description: "Cameroon's trusted agricultural marketplace for buyers and verified suppliers.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F9FAFB",
    theme_color: "#1E5E27",
    orientation: "portrait-primary",
    categories: ["business", "shopping", "productivity"],
    icons: [
      {
        src: "/images/agriculnet_favicon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
      {
        src: "/images/agriculnet_favicon_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}

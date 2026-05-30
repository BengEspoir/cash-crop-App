/**
 * Central catalog of per-page SEO metadata for the public site.
 * Each entry maps to Next.js `metadata` objects returned by `buildMetadata`.
 */
const siteName = "AgriculNet";
const defaultDescription =
  "AgriculNet connects Cameroonian farms with local and international markets through verified listings, protected payments, and coordinated logistics.";

export const seoCatalog = {
  home: {
    title: "AgriculNet — Trusted crop sourcing from Cameroon",
    description: defaultDescription,
  },
  browse: {
    title: "Browse active crop supply",
    description:
      "Explore verified cash crop listings from Cameroonian farms — maize, cocoa, coffee, banana, and more, with protected checkout.",
  },
  findFarmers: {
    title: "Find verified farmers and cooperatives",
    description:
      "Discover vetted smallholders and cooperatives ready to fulfill local and export orders across every major Cameroonian region.",
  },
  international: {
    title: "Export program for international buyers",
    description:
      "AgriculNet's export lane pairs international buyers with inspection-ready supply, documentation support, and logistics partners.",
  },
  compliance: {
    title: "ONCC and MINADER compliance",
    description:
      "See how AgriculNet aligns export-ready crop sourcing with ONCC and MINADER expectations for verified trade.",
  },
  about: {
    title: "Our mission and story",
    description:
      "Learn why AgriculNet was built, the team behind it, and how the platform expands trusted crop trade from Cameroon.",
  },
  requestQuote: {
    title: "Request a quote from AgriculNet suppliers",
    description:
      "Send an RFQ to multiple vetted farmers in one flow and receive protected-order ready responses within a tight window.",
  },
  buyerProtection: {
    title: "Buyer Protection on every protected order",
    description:
      "Learn how protected payments, inspection windows, and dispute support keep AgriculNet buyers confident on every transaction.",
  },
  help: {
    title: "Help Center",
    description:
      "Get answers about farmer verification, protected payments, inspections, and shipping coordination on AgriculNet.",
  },
  sell: {
    title: "Sell on AgriculNet",
    description:
      "Publish crop supply, reach local and international buyers, and receive protected settlement with AgriculNet's grower tools.",
  },
  mobile: {
    title: "AgriculNet Mobile App",
    description:
      "The AgriculNet mobile app puts listings, quotes, and protected order status in the hands of growers and buyers anywhere.",
  },
  pricing: {
    title: "Pricing",
    description:
      "Simple pricing for growers, cooperatives, and buyers — listing is always free; we only take a fee on completed protected orders.",
  },
  terms: {
    title: "Terms of Use",
    description: "AgriculNet terms of use — the rules that keep growers, buyers, and cooperatives trading safely.",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "How AgriculNet collects, stores, and protects personal and business information for farmers, cooperatives, and buyers.",
  },
  contact: {
    title: "Contact AgriculNet",
    description:
      "Reach the AgriculNet team for verification help, export program enquiries, inspections, and protected payment questions.",
  },
  verification: {
    title: "Farmer verification",
    description:
      "How AgriculNet verifies growers, cooperatives, and export-ready listings to keep every transaction trustworthy.",
  },
  tradeSupport: {
    title: "Trade support",
    description:
      "Work with AgriculNet trade coordinators on documentation, inspections, logistics, and dispute resolution for every order.",
  },
  inspectionsInfo: {
    title: "Inspections program",
    description:
      "Learn how AgriculNet's inspections partners verify quality, weight, and packaging before protected orders ship.",
  },
  logisticsInfo: {
    title: "Logistics program",
    description:
      "Coordinated inland hauling, port clearance, and freight partners for AgriculNet protected orders.",
  },
  documentationInfo: {
    title: "Trade documentation",
    description:
      "Phytosanitary certificates, export permits, and compliance paperwork coordinated for every AgriculNet export order.",
  },
};

/**
 * Build a Next.js `metadata` object for a given catalog key. Optional overrides
 * (title, description, alternates, openGraph) are merged on top.
 */
export function buildMetadata(key, overrides = {}) {
  const entry = seoCatalog[key] ?? {};
  const title =
    overrides.title ??
    (entry.title === siteName || entry.title?.includes(siteName)
      ? entry.title
      : `${entry.title ?? siteName} | ${siteName}`);
  const description = overrides.description ?? entry.description ?? defaultDescription;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName,
      type: "website",
      ...(overrides.openGraph ?? {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(overrides.twitter ?? {}),
    },
    ...(overrides.alternates ? { alternates: overrides.alternates } : {}),
  };
}

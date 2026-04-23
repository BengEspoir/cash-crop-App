/**
 * Curated imagery for AgriculNet with African / Cameroonian agricultural context.
 *
 * During development these are served directly from Unsplash (royalty-free,
 * commercial-use license). Once a Cloudinary account is connected, upload these
 * assets into Cloudinary and replace the `src` with a Cloudinary publicId.
 *
 * The <SmartImage /> component treats any value that starts with "http" as a
 * direct URL and anything else as a Cloudinary public id. This lets us swap
 * delivery without touching consumer code.
 */

// Unsplash URL helper. Applies `auto=format` + quality so the browser gets
// an AVIF/WebP variant when supported.
const u = (id, opts = {}) => {
  const w = opts.w ?? 1600;
  const q = opts.q ?? 75;
  const fit = opts.fit ?? "crop";
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=${fit}&w=${w}&q=${q}`;
};

export const brandImagery = {
  "sign-in": {
    src: u("1523741543316-beb7fc7023d8"),
    alt: "Farmer inspecting ripe coffee cherries before harvest",
    credit: "Photo via Unsplash",
  },
  register: {
    src: u("1500937386664-56d1dfef3854"),
    alt: "Verdant farmland used by cooperative growers across Central Africa",
    credit: "Photo via Unsplash",
  },
  "register-farmer": {
    src: u("1594026112284-02bb6f3352fe"),
    alt: "Farmer hands holding freshly harvested produce",
    credit: "Photo via Unsplash",
  },
  "register-buyer": {
    src: u("1504593811423-6dd665756598"),
    alt: "Trader sorting beans destined for export markets",
    credit: "Photo via Unsplash",
  },
  "forgot-password": {
    src: u("1506905925346-21bda4d32df4"),
    alt: "Calm sunrise over a smallholder farm",
    credit: "Photo via Unsplash",
  },
  "reset-password": {
    src: u("1464226184884-fa280b87c399"),
    alt: "Cooperative workers preparing the next season's harvest",
    credit: "Photo via Unsplash",
  },
  "verify-email": {
    src: u("1543362906-acfc16c67564"),
    alt: "Farmer checking crop readiness by hand",
    credit: "Photo via Unsplash",
  },
  "verify-phone": {
    src: u("1523712999610-f77fbcfc3843"),
    alt: "Mobile field notes taken while walking a crop line",
    credit: "Photo via Unsplash",
  },
  "admin-portal": {
    src: u("1567306226416-28f0efdc88ce"),
    alt: "Inspection and sorting workstation for export-ready lots",
    credit: "Photo via Unsplash",
  },
  pending: {
    src: u("1570145820404-cf22b115b06f"),
    alt: "Patient morning light over a community farm",
    credit: "Photo via Unsplash",
  },
};

// Landing + marketplace imagery. Used in hero, region cards, featured farmers, etc.
export const landingImagery = {
  hero: {
    src: u("1523741543316-beb7fc7023d8", { w: 2000 }),
    alt: "Farmer preparing a fresh coffee harvest",
  },
  heroSecondary: {
    src: u("1590502593747-42a996133562", { w: 1400 }),
    alt: "Cocoa pods splitting open on the tree",
  },
  paymentsBanner: {
    src: u("1519452575417-564c1401ecc0", { w: 1600 }),
    alt: "Bustling Cameroonian market at golden hour",
  },
  howItWorks: {
    src: u("1441974231531-c6227db76b6e", { w: 1200 }),
    alt: "Farmer walking the field at sunrise",
  },
};

// Region imagery keyed by region slug. Fallback gradient if not matched.
export const regionImagery = {
  "south-west": u("1500937386664-56d1dfef3854", { w: 1000 }),
  west: u("1523741543316-beb7fc7023d8", { w: 1000 }),
  littoral: u("1590502593747-42a996133562", { w: 1000 }),
  "north-west": u("1464226184884-fa280b87c399", { w: 1000 }),
  centre: u("1504593811423-6dd665756598", { w: 1000 }),
  east: u("1570145820404-cf22b115b06f", { w: 1000 }),
};

// Crop imagery keyed by crop id (matches demo-data ids where possible).
export const cropImagery = {
  "cocoa-kumba-premium": u("1590502593747-42a996133562", { w: 1200 }),
  "coffee-bafoussam-arabica": u("1523741543316-beb7fc7023d8", { w: 1200 }),
  "penja-pepper-signature": u("1506905925346-21bda4d32df4", { w: 1200 }),
  "cassava-bamenda-flour": u("1464226184884-fa280b87c399", { w: 1200 }),
};

export const cropFallback = u("1543362906-acfc16c67564", { w: 1200 });

// Static pages — keyed by route slug.
export const pageImagery = {
  help: { src: u("1523712999610-f77fbcfc3843", { w: 1600 }), alt: "Cooperative member checking crop readiness" },
  sell: { src: u("1594026112284-02bb6f3352fe", { w: 1600 }), alt: "Farmer hands holding freshly harvested produce" },
  mobile: { src: u("1488409976300-5c4c3f36b99c", { w: 1600 }), alt: "Farmer using a mobile phone in the field" },
  pricing: { src: u("1464226184884-fa280b87c399", { w: 1600 }), alt: "Workers weighing export-ready lots" },
  terms: { src: u("1554224155-6726b3ff858f", { w: 1600 }), alt: "Folder of signed cooperative agreements" },
  privacy: { src: u("1582213782179-e0d53f98f2ca", { w: 1600 }), alt: "Secure workspace for trade documentation" },
  contact: { src: u("1519452575417-564c1401ecc0", { w: 1600 }), alt: "Bustling Cameroonian market at golden hour" },
  verification: { src: u("1567306226416-28f0efdc88ce", { w: 1600 }), alt: "Inspection team verifying sorted beans" },
  "trade-support": { src: u("1504593811423-6dd665756598", { w: 1600 }), alt: "Trader reviewing documents before shipment" },
  "inspections-info": { src: u("1570145820404-cf22b115b06f", { w: 1600 }), alt: "Inspector reviewing crop lots at sunrise" },
  "logistics-info": { src: u("1601600395232-95dce02d8b1f", { w: 1600 }), alt: "Containers and pallets preparing for export" },
  "documentation-info": { src: u("1554224155-6726b3ff858f", { w: 1600 }), alt: "Document set for cross-border trade" },
};

// Default farmer avatars indexed by id. Used when a user has no profile photo.
export const farmerAvatars = {
  "jean-ngum": u("1567306226416-28f0efdc88ce", { w: 400, fit: "facearea" }),
  "amina-kofi": u("1504593811423-6dd665756598", { w: 400, fit: "facearea" }),
  "paul-meka": u("1594026112284-02bb6f3352fe", { w: 400, fit: "facearea" }),
  "sarah-ndzi": u("1570145820404-cf22b115b06f", { w: 400, fit: "facearea" }),
};

// Workspace cover imagery — surfaces a ribbon hero on dashboards & role pages.
export const workspaceImagery = {
  farmer: {
    src: u("1500937386664-56d1dfef3854", { w: 1800 }),
    alt: "Lush Cameroonian farmland at sunrise",
  },
  buyer: {
    src: u("1519452575417-564c1401ecc0", { w: 1800 }),
    alt: "Bustling West African trade market",
  },
  admin: {
    src: u("1567306226416-28f0efdc88ce", { w: 1800 }),
    alt: "Inspection and sorting station for export-ready produce",
  },
};

export function resolveWorkspaceImagery(role = "farmer") {
  return workspaceImagery[role] ?? workspaceImagery.farmer;
}

export function resolveBrandImagery(pathname) {
  const map = {
    "/sign-in": "sign-in",
    "/register": "register",
    "/register/farmer": "register-farmer",
    "/register/buyer": "register-buyer",
    "/forgot-password": "forgot-password",
    "/reset-password": "reset-password",
    "/verify-email": "verify-email",
    "/verify-phone": "verify-phone",
    "/admin-portal": "admin-portal",
    "/pending": "pending",
  };
  return brandImagery[map[pathname] ?? "sign-in"] ?? brandImagery["sign-in"];
}

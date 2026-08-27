export const cropSearchOptions = [
  "All crops",
  "Cocoa",
  "Coffee",
  "Maize",
  "Cassava",
  "Plantain",
  "Palm Oil",
  "Penja Pepper",
  "Banana",
];

export function matchesCrop(listing, category) {
  if (!category || category === "All crops") return true;
  const crop = String(listing?.crop || "").toLowerCase();
  const needle = String(category).toLowerCase();
  if (needle === "penja pepper") return crop.includes("penja") || crop.includes("pepper");
  return crop.includes(needle);
}

export function inferCropFromFilename(filename) {
  const value = String(filename || "").toLowerCase();
  return cropSearchOptions.slice(1).find((category) => {
    const terms = category.toLowerCase().split(" ");
    return terms.some((term) => value.includes(term));
  }) || null;
}


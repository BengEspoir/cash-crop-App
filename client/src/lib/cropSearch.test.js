import { describe, expect, it } from "vitest";
import { inferCropFromFilename, matchesCrop } from "@/lib/cropSearch";

describe("crop search", () => {
  it("filters listing names by the selected crop", () => {
    expect(matchesCrop({ crop: "Cocoa Beans" }, "Cocoa")).toBe(true);
    expect(matchesCrop({ crop: "Arabica Coffee" }, "Cocoa")).toBe(false);
    expect(matchesCrop({ crop: "Penja Pepper" }, "Penja Pepper")).toBe(true);
  });

  it("keeps all listings selected for the all-crops option", () => {
    expect(matchesCrop({ crop: "Plantain" }, "All crops")).toBe(true);
  });

  it("uses an image filename only as an explicit crop-search hint", () => {
    expect(inferCropFromFilename("fresh-plantain-bunch.jpg")).toBe("Plantain");
    expect(inferCropFromFilename("camera-upload.jpg")).toBeNull();
  });
});


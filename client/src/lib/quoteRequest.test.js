import { describe, expect, it } from "vitest";
import { buildQuoteRequestMessage } from "@/lib/quoteRequest";

describe("quote request message", () => {
  it("preserves sourcing details in the existing quote message contract", () => {
    const message = buildQuoteRequestMessage({
      variety: "Arabica",
      grade: "Grade 1",
      destination: "Douala",
      incoterm: "FOB",
      contactName: "A Buyer",
      email: "buyer@example.com",
      notes: "Moisture certificate requested",
    });

    expect(message).toContain("Variety: Arabica");
    expect(message).toContain("Destination: Douala");
    expect(message).toContain("Additional requirements: Moisture certificate requested");
  });

  it("omits empty optional fields", () => {
    expect(buildQuoteRequestMessage({ grade: "Standard", company: "" })).toBe("Required grade: Standard");
  });
});


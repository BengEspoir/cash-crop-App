import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MarkdownMessage } from "./MarkdownMessage";

const markdown = `# Heading

**Bold text**

*Italic text*

- Bullet one
  - Nested bullet
- Bullet two

1. First step
2. Second step

[Marketplace guide](https://example.com/guide)

\`inline code\`

\`\`\`js
const crop = "Cocoa";
\`\`\`

> Important note

| Crop | Price |
|------|-------|
| Cocoa | Example |`;

describe("MarkdownMessage", () => {
  test("renders sanitized GFM structures without exposing raw syntax", () => {
    const { container } = render(<MarkdownMessage content={markdown} />);

    expect(screen.getByRole("heading", { name: "Heading" })).toBeInTheDocument();
    expect(screen.getByText("Bold text").tagName).toBe("STRONG");
    expect(screen.getByText("Italic text").tagName).toBe("EM");
    expect(screen.getByText("Bullet one").closest("ul")).toBeInTheDocument();
    expect(screen.getByText("First step").closest("ol")).toBeInTheDocument();
    expect(screen.getByText("inline code").tagName).toBe("CODE");
    expect(screen.getByText("Important note").closest("blockquote")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Marketplace guide" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByRole("link", { name: "Marketplace guide" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(container).not.toHaveTextContent("**Bold text**");
  });

  test("renders malformed Markdown as readable content without crashing", () => {
    render(<MarkdownMessage content={"**Unclosed emphasis\n\n| Broken | table"} />);

    expect(screen.getByText(/Unclosed emphasis/)).toBeInTheDocument();
    expect(screen.getByText(/Broken/)).toBeInTheDocument();
  });
});

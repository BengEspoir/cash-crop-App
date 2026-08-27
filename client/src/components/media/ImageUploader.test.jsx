import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import imageCompression from "browser-image-compression";
import { uploadAsset } from "../../lib/uploads";
import { ImageUploader } from "./ImageUploader";

vi.mock("browser-image-compression", () => ({ default: vi.fn() }));
vi.mock("../../lib/uploads", () => ({ uploadAsset: vi.fn() }));

describe("ImageUploader low-bandwidth path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("compresses each image before uploading it", async () => {
    const original = new File([new Uint8Array(2048)], "crop.jpg", { type: "image/jpeg" });
    const compressed = new File([new Uint8Array(512)], "crop.jpg", { type: "image/jpeg" });
    imageCompression.mockResolvedValue(compressed);
    uploadAsset.mockResolvedValue({ url: "https://example.test/crop.jpg", path: "listings/crop.jpg", bucket: "assets" });
    const onChange = vi.fn();
    const { container } = render(<ImageUploader value={[]} onChange={onChange} />);

    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [original] } });

    await waitFor(() => expect(uploadAsset).toHaveBeenCalledWith(compressed, expect.objectContaining({ folder: "listings" })));
    expect(imageCompression).toHaveBeenCalledWith(original, expect.objectContaining({ maxSizeMB: 0.9, useWebWorker: true }));
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ originalBytes: 2048, uploadedBytes: 512 })]);
  });
});

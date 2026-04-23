"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { Button } from "../ui/button";
import { hasCloudinary, uploadToCloudinary } from "../../lib/cloudinary";
import { cn } from "../../lib/utils";

/**
 * Reusable gallery uploader.
 *
 * Inputs
 *  - value: array of { url, publicId?, alt? } — controlled gallery
 *  - onChange(next): replacement array
 *  - folder: Cloudinary folder for uploads
 *  - max: maximum number of images
 *
 * Behaviour
 *  - If Cloudinary is configured (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME +
 *    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) we upload the File directly and
 *    store the secure_url + public_id.
 *  - If Cloudinary is NOT configured we generate a local object URL so the
 *    preview still works end-to-end in demo mode. The URL is memory-only; the
 *    caller is expected to re-upload on submit in production.
 *
 *  - The first image is treated as the cover. "Set as cover" promotes any
 *    image; "Remove" drops it and revokes the blob URL.
 */
export function ImageUploader({
  value = [],
  onChange,
  folder = "agriculnet/listings",
  max = 6,
  hint,
  disabled,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const remaining = Math.max(0, max - value.length);
  const hasItems = value.length > 0;

  const cloudinaryReady = useMemo(() => hasCloudinary, []);

  const handleFiles = useCallback(
    async (fileList) => {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList).slice(0, remaining);
      if (files.length === 0) {
        setError(`Maximum ${max} images`);
        return;
      }
      setError(null);
      setBusy(true);
      setProgress(0);

      const next = [...value];
      try {
        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          if (cloudinaryReady) {
            const result = await uploadToCloudinary(file, {
              folder,
              onProgress: (ratio) => setProgress(((i + ratio) / files.length) * 100),
            });
            next.push({
              url: result.secure_url,
              publicId: result.public_id,
              alt: file.name,
            });
          } else {
            next.push({
              url: URL.createObjectURL(file),
              publicId: null,
              alt: file.name,
              local: true,
            });
            setProgress(((i + 1) / files.length) * 100);
          }
        }
        onChange?.(next);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Upload failed");
      } finally {
        setBusy(false);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [cloudinaryReady, folder, max, onChange, remaining, value],
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      if (disabled || busy) return;
      handleFiles(event.dataTransfer?.files);
    },
    [disabled, busy, handleFiles],
  );

  const handleRemove = (index) => {
    const item = value[index];
    if (item?.local && item.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(item.url);
      } catch {
        // ignore
      }
    }
    const next = value.filter((_, idx) => idx !== index);
    onChange?.(next);
  };

  const handleCover = (index) => {
    if (index === 0) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange?.(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-green-200 bg-green-50/40 px-6 py-7 text-center transition hover:border-green-400 hover:bg-green-50",
          disabled && "pointer-events-none opacity-60",
          hasItems ? "py-5" : "py-8",
        )}
      >
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-white shadow-soft">
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
        </span>
        <div className="space-y-1">
          <p className="text-[13.5px] font-semibold text-ink-800">
            {busy
              ? `Uploading… ${Math.round(progress)}%`
              : hasItems
                ? `Drop more or click to add (${remaining} slots left)`
                : "Drop photos here or click to upload"}
          </p>
          <p className="text-[12px] text-ink-500">
            {hint ??
              (cloudinaryReady
                ? "High-quality JPG or PNG up to ~10MB. First image becomes the cover."
                : "Demo mode — previews are local. Wire Cloudinary env vars to persist.")}
          </p>
          {error ? <p className="text-[12px] font-medium text-red-600">{error}</p> : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
          disabled={disabled || busy || remaining === 0}
        />
      </div>

      {hasItems ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((item, index) => (
            <li
              key={`${item.publicId ?? item.url}-${index}`}
              className={cn(
                "group relative overflow-hidden rounded-[14px] border border-ink-100 bg-white shadow-soft",
                index === 0 && "ring-2 ring-green-500",
              )}
            >
              <div className="relative aspect-[4/3] w-full bg-ink-50">
                {item.url ? (
                  <Image
                    src={item.url}
                    alt={item.alt || `Listing photo ${index + 1}`}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                    unoptimized={item.local}
                  />
                ) : null}
                {index === 0 ? (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-green-600/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    <Star className="h-3 w-3" /> Cover
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-1 px-2 py-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-green-800 hover:text-green-900 disabled:cursor-default disabled:text-ink-400"
                  onClick={() => handleCover(index)}
                  disabled={index === 0}
                >
                  <Star className="h-3 w-3" />
                  {index === 0 ? "Cover" : "Set cover"}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-700"
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {!hasItems ? (
        <div className="flex items-center gap-2 text-[12px] text-ink-500">
          <ImagePlus className="h-4 w-4" /> Add at least one photo before publishing.
        </div>
      ) : null}

      {remaining === 0 ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange?.([])}
          className="w-full"
        >
          Clear gallery
        </Button>
      ) : null}
    </div>
  );
}

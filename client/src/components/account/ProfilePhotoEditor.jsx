"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaAvatar } from "@/components/media/Avatar";
import { uploadAsset } from "@/lib/uploads";
import { useUpdateProfile } from "@/hooks/useAccountProfile";

function croppedFileName(file) {
  const base = String(file?.name || "profile-photo").replace(/\.[^.]+$/, "");
  return `${base}-avatar.jpg`;
}

async function createCroppedAvatarFile(file, zoom = 1, position = { x: 0, y: 0 }) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const sourceSize = Math.min(bitmap.width, bitmap.height) / Math.max(1, zoom);
  const maxX = Math.max(0, bitmap.width - sourceSize);
  const maxY = Math.max(0, bitmap.height - sourceSize);
  const centerX = maxX / 2;
  const centerY = maxY / 2;
  const sx = Math.min(maxX, Math.max(0, centerX + (position.x * centerX)));
  const sy = Math.min(maxY, Math.max(0, centerY + (position.y * centerY)));

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, sx, sy, sourceSize, sourceSize, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Could not crop profile photo.");
  return new File([blob], croppedFileName(file), { type: "image/jpeg" });
}

export function ProfilePhotoEditor({
  user,
  initials,
  displayName = "Profile photo",
  size = "xl",
  className = "",
  buttonClassName = "",
  avatarClassName = "",
  compact = false,
}) {
  const inputRef = useRef(null);
  const updateProfile = useUpdateProfile();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const avatarInitials = useMemo(() => initials || [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AN", [initials, user]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const resetEditor = () => {
    setFile(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    if (inputRef.current) inputRef.current.value = "";
  };

  const closeEditor = () => {
    resetEditor();
    setOpen(false);
  };

  const savePhoto = async () => {
    if (!file) return;
    setIsSaving(true);
    try {
      const croppedFile = await createCroppedAvatarFile(file, zoom, position);
      const uploaded = await uploadAsset(croppedFile, { folder: "profiles" });
      await updateProfile.mutateAsync({ profile_image_url: uploaded.url });
      toast.success("Profile photo updated.");
      closeEditor();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Profile photo could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={className}>
      <div className={compact ? "inline-flex items-center gap-3" : "text-center"}>
        <MediaAvatar
          src={user?.profile_image_url}
          alt={displayName}
          initials={avatarInitials}
          size={size}
          className={avatarClassName}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={buttonClassName || "mt-4 inline-flex items-center justify-center gap-2 rounded-lg text-[14px] font-bold text-green-800 underline-offset-4 hover:underline"}
        >
          <Camera className="h-4 w-4" />
          Edit profile image
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/60 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
              <div>
                <h2 className="font-display text-[24px] leading-tight text-ink-950">Edit profile image</h2>
                <p className="mt-1 text-[14px] text-ink-500">Upload and crop a square avatar for your profile.</p>
              </div>
              <button type="button" onClick={closeEditor} className="focus-ring rounded-full p-2 text-ink-500 hover:bg-ink-100" aria-label="Close profile image editor">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="block w-full rounded-lg border border-ink-200 p-3 text-[14px]"
              />

              <div className="mx-auto flex h-72 w-72 items-center justify-center overflow-hidden rounded-full border-8 border-green-50 bg-ink-100">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Profile photo crop preview"
                    className="h-full w-full object-cover"
                    style={{
                      transform: `translate(${position.x * -16}%, ${position.y * -16}%) scale(${zoom})`,
                      transformOrigin: "center",
                    }}
                  />
                ) : (
                  <MediaAvatar src={user?.profile_image_url} alt={displayName} initials={avatarInitials} size="xl" className="h-52 w-52 text-[40px]" />
                )}
              </div>

              <label className="block space-y-2">
                <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink-400">Zoom crop</span>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.05"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  disabled={!file}
                  className="w-full accent-green-800"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink-400">Horizontal position</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={position.x}
                    onChange={(event) => setPosition((current) => ({ ...current, x: Number(event.target.value) }))}
                    disabled={!file}
                    className="w-full accent-green-800"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink-400">Vertical position</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={position.y}
                    onChange={(event) => setPosition((current) => ({ ...current, y: Number(event.target.value) }))}
                    disabled={!file}
                    className="w-full accent-green-800"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-ink-100 px-6 py-4">
              <Button type="button" variant="secondary" onClick={closeEditor}>Cancel</Button>
              <Button type="button" variant="accent-gold" onClick={savePhoto} disabled={!file || isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save photo
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import {
  Camera,
  Loader2,
  Mic,
  RotateCcw,
  Search,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/authStore";
import { useMarketplaceSearch } from "@/hooks/useMarketplaceSearch";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { AuthRequiredDialog } from "./AuthRequiredDialog";
import { SearchModeTabs } from "./SearchModeTabs";
import { SearchResultInsight } from "./SearchResultInsight";

const DRAFT_KEY = "agriculnet-marketplace-search-draft";
const SEARCH_MODES = new Set(["standard", "ai", "image", "voice"]);
const normalizeMode = value => SEARCH_MODES.has(value) ? value : "standard";
const CROPS = [
  "Cocoa",
  "Coffee",
  "Maize",
  "Plantain",
  "Palm Oil",
  "Cassava",
  "Banana",
  "Pepper",
  "Rice",
  "Groundnut",
  "Beans",
  "Honey",
];

const readDraft = () => {
  try {
    return JSON.parse(window.sessionStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
};

const writeDraft = draft => {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // A search still works when private browsing blocks session storage.
  }
};

const fileFromDataUrl = async draft => {
  if (!draft?.imageDataUrl) return null;
  const blob = await fetch(draft.imageDataUrl).then(response => response.blob());
  return new File([blob], draft.imageName || "crop-search.jpg", {
    type: draft.imageType || blob.type || "image/jpeg",
  });
};

const mutationError = (...mutations) => {
  const error = mutations.find(item => item.error)?.error;
  return error?.response?.data?.message || error?.message || "";
};

export function AgriculNetSearch({
  initialQuery = "",
  initialMode = "standard",
  onStandardSearch,
  onResults,
  compact = false,
  className,
}) {
  const { user, isAuthenticated } = useAuth();
  const [mode, setMode] = useState(() => normalizeMode(initialMode));
  const [query, setQuery] = useState(initialQuery);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [productOverride, setProductOverride] = useState("");
  const [result, setResult] = useState(null);
  const [localError, setLocalError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const imageInputRef = useRef(null);
  const { aiSearch, imageSearch, transcribe } = useMarketplaceSearch();
  const recorder = useVoiceRecorder();
  const { history, remember, clear } = useSearchHistory(user?.id);

  useEffect(() => {
    setQuery(initialQuery || "");
    setMode(normalizeMode(initialMode));
  }, [initialMode, initialQuery]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const draft = readDraft();
    if (!draft) return;
    setMode(draft.mode || "standard");
    setQuery(draft.query || "");
    setProductOverride(draft.productOverride || "");
    if (draft.imageDataUrl) {
      setImagePreview(draft.imageDataUrl);
      fileFromDataUrl(draft).then(setImageFile).catch(() => {});
    }
    window.sessionStorage.removeItem(DRAFT_KEY);
  }, [isAuthenticated]);

  useEffect(() => () => {
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const requireAuth = nextMode => {
    if (isAuthenticated) return false;
    writeDraft({
      mode: nextMode,
      query,
      productOverride,
      imageDataUrl: nextMode === "image" ? imagePreview : "",
      imageName: nextMode === "image" ? imageFile?.name : "",
      imageType: nextMode === "image" ? imageFile?.type : "",
    });
    setAuthOpen(true);
    return true;
  };

  const changeMode = nextMode => {
    setLocalError("");
    if (nextMode !== "standard" && requireAuth(nextMode)) return;
    setMode(nextMode);
  };

  const handleImage = async event => {
    const original = event.target.files?.[0];
    event.target.value = "";
    if (!original) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(original.type)) {
      setLocalError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (original.size > 6 * 1024 * 1024) {
      setLocalError("The image must be 6 MB or smaller.");
      return;
    }

    setCompressing(true);
    setLocalError("");
    try {
      const compressed = await imageCompression(original, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        preserveExif: false,
      });
      const file = new File([compressed], original.name, {
        type: compressed.type || original.type,
      });
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        setImagePreview(dataUrl);
        writeDraft({
          mode: "image",
          query,
          productOverride,
          imageDataUrl: dataUrl,
          imageName: file.name,
          imageType: file.type,
        });
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      setResult(null);
    } catch {
      setLocalError("We could not prepare that image. Try another one.");
    } finally {
      setCompressing(false);
    }
  };

  const submit = async event => {
    event?.preventDefault?.();
    setLocalError("");
    setResult(null);

    if (mode === "standard") {
      onStandardSearch?.(query.trim());
      if (isAuthenticated) remember(query, mode);
      return;
    }
    if (requireAuth(mode)) return;

    try {
      let nextResult;
      if (mode === "image") {
        if (!imageFile && !productOverride) {
          setLocalError("Add a crop photo or choose the crop manually.");
          return;
        }
        nextResult = await imageSearch.mutateAsync({
          file: imageFile,
          productOverride,
        });
      } else {
        if (query.trim().length < 2) {
          setLocalError("Enter or record a search request.");
          return;
        }
        nextResult = await aiSearch.mutateAsync(query.trim());
      }
      setResult(nextResult);
      onResults?.(nextResult);
      remember(mode === "image" ? productOverride || nextResult?.classification?.crop : query, mode);
    } catch {
      // Mutation errors are rendered below without exposing provider internals.
    }
  };

  const stopRecording = async () => {
    const file = await recorder.stop();
    if (!file) return;
    try {
      const data = await transcribe.mutateAsync(file);
      setQuery(data?.transcript || "");
      setLocalError("");
    } catch {
      // The actionable request error is rendered below.
    }
  };

  const isBusy = aiSearch.isPending || imageSearch.isPending || transcribe.isPending || compressing;
  const error = localError || recorder.error || mutationError(aiSearch, imageSearch, transcribe);

  return (
    <section
      className={cn(
        "rounded-[20px] border border-ink-100 bg-white p-4 shadow-sm sm:p-5",
        compact ? "space-y-3" : "space-y-4",
        className,
      )}
      aria-label="Search the AgriculNet marketplace"
    >
      <SearchModeTabs value={mode} onChange={changeMode} />

      <form onSubmit={submit} className="space-y-3" role="search">
        {mode === "image" ? (
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="focus-ring relative flex min-h-36 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-green-200 bg-green-50/40 p-4 text-center hover:border-green-400"
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Selected crop search preview"
                  fill
                  sizes="600px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex flex-col items-center gap-2 text-[13px] font-semibold text-green-900">
                  <Camera className="h-6 w-6" aria-hidden="true" />
                  Take or upload a crop photo
                  <span className="font-normal text-ink-500">JPG, PNG, or WebP ? max 6 MB</span>
                </span>
              )}
            </button>
            <div className="space-y-2">
              <label htmlFor="crop-correction" className="text-[12px] font-bold uppercase tracking-wide text-ink-500">
                Confirm or correct crop
              </label>
              <select
                id="crop-correction"
                value={productOverride}
                onChange={event => setProductOverride(event.target.value)}
                className="h-12 w-full rounded-xl border border-ink-200 bg-white px-3 text-[14px] outline-none focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
              >
                <option value="">Identify from photo</option>
                {CROPS.map(crop => <option key={crop} value={crop}>{crop}</option>)}
              </select>
              {imagePreview ? (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                    setProductOverride("");
                  }}
                  className="focus-ring inline-flex items-center gap-1 text-[12px] font-semibold text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove image
                </button>
              ) : null}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="sr-only"
              onChange={handleImage}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
              <span className="sr-only">Marketplace search</span>
              <input
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder={mode === "standard"
                  ? "Search crops, suppliers, or locations"
                  : mode === "voice"
                    ? "Your transcript appears here for review"
                    : "e.g. Verified cocoa farmers in Kumba with at least 2 MT"}
                className="h-12 w-full rounded-xl border border-ink-200 bg-ink-50/50 pl-12 pr-4 text-[14px] outline-none focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-800/10"
              />
            </label>

            {mode === "voice" ? (
              recorder.isRecording ? (
                <div className="flex gap-2">
                  <Button type="button" onClick={stopRecording} className="bg-red-600 hover:bg-red-700">
                    <Square className="mr-2 h-4 w-4 fill-current" />
                    Stop ? {recorder.seconds}s
                  </Button>
                  <Button type="button" variant="outline" onClick={recorder.cancel} aria-label="Cancel recording">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" onClick={recorder.start} disabled={isBusy}>
                  <Mic className="mr-2 h-4 w-4" />
                  Record
                </Button>
              )
            ) : null}
          </div>
        )}

        {recorder.isRecording ? (
          <div className="flex items-center gap-2 text-[13px] font-semibold text-red-700" aria-live="polite">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-600" />
            Recording. Stop when finished; you can edit the transcript before searching.
          </div>
        ) : null}

        {mode === "voice" && query && !recorder.isRecording ? (
          <p className="flex items-center gap-2 text-[12px] text-ink-500">
            <RotateCcw className="h-3.5 w-3.5" />
            Review and edit the transcript, then select Search marketplace.
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isBusy || recorder.isRecording}
          className="w-full bg-[#1E5E27] hover:bg-[#174b20] sm:w-auto sm:min-w-44"
        >
          {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {compressing
            ? "Preparing image..."
            : transcribe.isPending
              ? "Transcribing..."
              : mode === "image"
                ? "Find matching listings"
                : "Search marketplace"}
        </Button>
      </form>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <SearchResultInsight result={result} />

      {isAuthenticated && history.length ? (
        <div className="border-t border-ink-100 pt-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] font-bold uppercase tracking-wide text-ink-400">Recent searches</p>
            <button type="button" onClick={clear} className="text-[12px] font-semibold text-green-800">
              Clear
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {history.slice(0, 5).map(item => (
              <button
                key={`${item.createdAt}-${item.query}`}
                type="button"
                onClick={() => {
                  setMode(item.mode === "image" ? "ai" : item.mode);
                  setQuery(item.query);
                }}
                className="focus-ring rounded-full bg-ink-50 px-3 py-1.5 text-[12px] text-ink-600 hover:bg-green-50 hover:text-green-800"
              >
                {item.query}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <AuthRequiredDialog open={authOpen} onOpenChange={setAuthOpen} />
    </section>
  );
}

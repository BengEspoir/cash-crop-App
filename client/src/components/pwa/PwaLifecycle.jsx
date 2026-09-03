"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw, WifiOff, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const DISMISS_KEY = "agriculnet-install-dismissed-at";

export function PwaLifecycle() {
  const { user } = useAuth();
  const [online, setOnline] = useState(true);
  const [installEvent, setInstallEvent] = useState(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstall = (event) => {
      event.preventDefault();
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissedAt > 7 * 24 * 60 * 60 * 1000) setInstallEvent(event);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onInstall);

    const isIos = typeof window !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = typeof window !== "undefined" && (window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches);
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (isIos && !isStandalone && Date.now() - dismissedAt > 7 * 24 * 60 * 60 * 1000) {
      setShowIosPrompt(true);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((registration) => {
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setUpdateReady(true);
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(worker);
              setUpdateReady(true);
            }
          });
        });
      }).catch(() => undefined);

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onInstall);
    };
  }, [user?.id]);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  function dismissInstall() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setInstallEvent(null);
    setShowIosPrompt(false);
  }

  function applyUpdate() {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  }

  return (
    <>
      {!online ? (
        <div role="status" className="fixed inset-x-0 bottom-4 z-[80] mx-auto flex w-[min(92%,520px)] items-center justify-center gap-2 rounded-xl bg-ink-950 px-4 py-3 text-[13px] font-semibold text-white shadow-lift">
          <WifiOff className="h-4 w-4" /> Offline - drafts remain available; protected actions require a connection.
        </div>
      ) : null}
      {installEvent ? (
        <div className="fixed bottom-4 left-4 z-[75] flex max-w-[360px] items-center gap-3 rounded-2xl border border-green-100 bg-white p-4 shadow-lift">
          <Download className="h-5 w-5 shrink-0 text-green-800" />
          <div className="min-w-0 flex-1"><p className="text-[14px] font-bold text-ink-950">Install AgriculNet</p><p className="text-[12px] text-ink-500">Faster access and saved drafts on this device.</p></div>
          <button type="button" onClick={install} className="rounded-lg bg-green-800 px-3 py-2 text-[12px] font-bold text-white">Install</button>
          <button type="button" onClick={dismissInstall} aria-label="Dismiss install suggestion" className="p-1 text-ink-500"><X className="h-4 w-4" /></button>
        </div>
      ) : null}
      {showIosPrompt && !installEvent ? (
        <div className="fixed bottom-4 left-4 z-[75] flex max-w-[360px] items-center gap-3 rounded-2xl border border-green-100 bg-white p-4 shadow-lift">
          <Download className="h-5 w-5 shrink-0 text-green-800" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-ink-950">Install AgriculNet</p>
            <p className="text-[12px] text-ink-600">
              Tap Safari Share <span className="font-bold">[↑]</span> and select &ldquo;Add to Home Screen&rdquo;.
            </p>
          </div>
          <button type="button" onClick={dismissInstall} aria-label="Dismiss install suggestion" className="p-1 text-ink-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      {updateReady ? (
        <button type="button" onClick={applyUpdate} className="fixed bottom-4 right-4 z-[75] inline-flex items-center gap-2 rounded-xl bg-green-800 px-4 py-3 text-[13px] font-bold text-white shadow-lift hover:bg-green-900">
          <RefreshCw className="h-4 w-4" /> Update AgriculNet
        </button>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BellRing } from "lucide-react";
import api from "@/lib/axios";

const preferences = {
  orders: true,
  messages: true,
  payments: true,
  verification: true,
  system: true,
};

function decodeVapidKey(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
}

export function PushNotificationSettings({ panel: Panel, button: Button }) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const available = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(available);
    if (available) {
      navigator.serviceWorker.ready
        .then((registration) => registration.pushManager.getSubscription())
        .then((subscription) => setEnabled(Boolean(subscription)))
        .catch(() => undefined);
    }
  }, []);

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
    if (!publicKey) {
      toast.error("Push notifications are not configured for this deployment.");
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notification permission was not granted.");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(publicKey),
      });
      await api.post("/notifications/push/subscribe", {
        subscription: subscription.toJSON(),
        preferences,
      });
      setEnabled(true);
      toast.success("Push notifications enabled on this device.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Push notifications could not be enabled.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await api.post("/notifications/push/unsubscribe", { endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      setEnabled(false);
      toast.success("Push notifications disabled on this device.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Push notifications could not be disabled.");
    } finally {
      setBusy(false);
    }
  }

  const content = (
    <div className="flex flex-col gap-4 rounded-2xl border border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-green-800" />
        <div>
          <p className="font-bold text-ink-950">Browser push notifications</p>
          <p className="mt-1 text-[13px] leading-6 text-ink-500">Opt in on this device for privacy-safe alerts. AgriculNet never includes order, payment, or identity details in the lock-screen message.</p>
        </div>
      </div>
      <Button type="button" variant={enabled ? "outline" : "primary"} onClick={enabled ? disable : enable} disabled={!supported || busy}>
        {!supported ? "Not supported" : busy ? "Saving..." : enabled ? "Disable push" : "Enable push"}
      </Button>
    </div>
  );

  return Panel ? <Panel title="Push notifications">{content}</Panel> : content;
}

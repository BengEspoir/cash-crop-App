"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MessageCircle, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useStartConversation } from "../../hooks/useMessages";
import useAuth from "../../hooks/useAuth";
import { getLoginRoute } from "../../lib/authRoutes";
import { cn } from "../../lib/utils";

export function SupplierMessageDialog({ listing, className }) {
  const router = useRouter();
  const { user, isBuyer } = useAuth();
  const startConversation = useStartConversation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = message.trim();
    if (!user) {
      toast.error("Sign in as a buyer to message this supplier.");
      router.push(getLoginRoute(`/crops/${listing.id}`));
      return;
    }
    if (!isBuyer) {
      toast.error("Buyer accounts can start supplier inquiries.");
      return;
    }
    if (content.length < 2) {
      toast.error("Write a short inquiry before sending.");
      return;
    }

    try {
      const result = await startConversation.mutateAsync({
        ...(listing.resellerId ? { resellerId: listing.resellerId } : { farmerId: listing.farmerId }),
        listingId: listing.id,
        initialMessage: content,
      });
      if (result?.farmerWarning) toast(result.farmerWarning);
      setOpen(false);
      setMessage("");
      toast.success("Inquiry sent through AgriculNet.");
      router.push(`/buyer/messages/${result.conversation.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "The supplier message could not be sent.");
    }
  };

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className={cn("h-11 w-full gap-2 bg-[#1E5E27] hover:bg-[#174B20]", className)}>
        <MessageCircle className="h-4 w-4" /> Message Supplier
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-[27px]">Message supplier</DialogTitle>
            <DialogDescription>
              Ask about {listing.crop || "this crop"}. AgriculNet keeps personal phone numbers private and stores replies in your dashboard chat.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <label className="mt-5 block space-y-2">
              <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink-500">Your inquiry</span>
              <textarea
                autoFocus
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={2000}
                rows={6}
                placeholder="Hello, I am interested in the available quantity. Please confirm inspection and delivery terms."
                className="w-full rounded-xl border border-ink-200 px-4 py-3 text-[15px] leading-6 outline-none focus:border-green-700 focus:ring-4 focus:ring-green-800/10"
              />
            </label>
            <div className="mt-3 flex gap-2 rounded-xl bg-green-50 p-3 text-[12px] leading-5 text-green-900">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              When WhatsApp relay is configured, the supplier receives this inquiry without seeing your phone number. Their reply returns to this chat.
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={startConversation.isPending} className="bg-[#1E5E27] hover:bg-[#174B20]">
                {startConversation.isPending ? "Sending..." : "Send securely"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

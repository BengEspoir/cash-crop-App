"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { CameraCapture } from "@/components/media/CameraCapture";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/axios";
import toast from "react-hot-toast";

const STEPS = [
  {
    id: "id_front",
    label: "ID Card (Front)",
    description: "Hold the front of your National ID card clearly in view.",
  },
  {
    id: "id_back",
    label: "ID Card (Back)",
    description: "Hold the back of your National ID card clearly in view.",
  },
  {
    id: "selfie",
    label: "Live Selfie",
    description: "Look directly at the camera. This is used for biometric matching.",
  },
];

export default function VerifyIdentityPage() {
  const router = useRouter();
  const { user, fetchMe } = useAuth();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [captures, setCaptures] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = STEPS[currentStepIdx];

  const handleCapture = (dataUrl) => {
    setCaptures((prev) => ({ ...prev, [currentStep.id]: dataUrl }));
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const dataUrlToFile = (dataUrl, filename) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const submitVerification = async () => {
    setIsSubmitting(true);
    try {
      // Submit directly to the backend so evidence lands in private Supabase storage.
      const formData = new FormData();
      formData.append("idFront", dataUrlToFile(captures.id_front, "national-id-front.jpg"));
      formData.append("idBack", dataUrlToFile(captures.id_back, "national-id-back.jpg"));
      formData.append("selfie", dataUrlToFile(captures.selfie, "live-selfie.jpg"));

      await api.post("/auth/submit-identity", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsComplete(true);
      await fetchMe();
      toast.success("Verification submitted successfully!");
      
      setTimeout(() => {
        router.push("/pending");
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mb-2 font-display text-2xl font-bold text-ink-900">Submission Received</h1>
        <p className="max-w-md text-ink-600">
          Thank you for completing your identity verification. Our team will review your documents and biometrics shortly.
        </p>
        <p className="mt-4 text-sm font-medium text-ink-500 italic">Redirecting to dashboard...</p>
      </div>
    );
  }

  const allCaptured = STEPS.every((step) => !!captures[step.id]);

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <header>
        <div className="flex items-center gap-2 text-green-700">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-[13px] font-bold uppercase tracking-wider">Identity Verification</span>
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink-900">Secure Your Profile</h1>
        <p className="mt-1 text-ink-600">
          National ID scan and live biometric matching required for all seller accounts.
        </p>
      </header>

      {!allCaptured ? (
        <div className="space-y-6">
          <div className="flex gap-2">
            {STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  idx <= currentStepIdx ? "bg-green-600" : "bg-ink-100"
                }`}
              />
            ))}
          </div>
          <CameraCapture
            key={currentStep.id}
            label={currentStep.label}
            description={currentStep.description}
            onCapture={handleCapture}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-bold text-ink-900">Review your captures</h2>
            <div className="grid grid-cols-3 gap-4">
              {STEPS.map((step) => (
                <div key={step.id} className="space-y-2">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg bg-ink-100">
                    <div className="relative h-full w-full">
                      <Image
                        src={captures[step.id]}
                        className="object-cover"
                        alt={step.label}
                        fill
                        sizes="33vw"
                        unoptimized
                      />
                    </div>
                  </div>
                  <p className="text-center text-[12px] font-bold text-ink-700">{step.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setCaptures({});
                setCurrentStepIdx(0);
              }}
              disabled={isSubmitting}
            >
              Start Over
            </Button>
            <Button
              className="flex-1 bg-green-700 text-white hover:bg-green-800"
              onClick={submitVerification}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" /> Submit for Review
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <footer className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <p className="text-[12.5px] leading-relaxed text-blue-800">
          <strong>Privacy Note:</strong> Your ID and biometric data are encrypted and used strictly for identity verification. We never share your sensitive documents with third parties.
        </p>
      </footer>
    </div>
  );
}

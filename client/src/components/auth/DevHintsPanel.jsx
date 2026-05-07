"use client";

import Link from "next/link";
import { Button } from "../ui/button";

export function DevHintsPanel({ hints }) {
  if (!hints) {
    return null;
  }

  const entries = [
    hints.otpCode ? { label: "OTP code", value: hints.otpCode } : null,
    hints.phoneNumber ? { label: "Target phone", value: hints.phoneNumber } : null,
    hints.message ? { label: "SMS message", value: hints.message } : null,
    hints.verificationEmail ? { label: "Verification email", value: hints.verificationEmail } : null,
    hints.passwordResetEmail ? { label: "Reset email", value: hints.passwordResetEmail } : null,
  ].filter(Boolean);

  return (
    <div className="rounded-[14px] border border-[#D1ECF1] bg-[#F4FBFD] p-4 text-[13px] text-[#0C5460]">
      <p className="font-semibold text-[#0C5460]">Development testing hints</p>
      <p className="mt-2 leading-6">
        External delivery is running in local fallback mode, so you can complete the flow from the browser with the values below.
      </p>

      {entries.length ? (
        <div className="mt-3 grid gap-2">
          {entries.map((entry) => (
            <div key={entry.label} className="rounded-[10px] bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4F7A85]">{entry.label}</p>
              <p className="mt-1 font-mono text-[13px] text-[#0C5460]">{entry.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-3">
        {hints.verificationLink ? (
          <Button asChild variant="outline" className="border-[#0C5460] text-[#0C5460] hover:bg-[#D1ECF1]">
            <Link href={hints.verificationLink}>Open verification link</Link>
          </Button>
        ) : null}
        {hints.passwordResetLink ? (
          <Button asChild variant="outline" className="border-[#0C5460] text-[#0C5460] hover:bg-[#D1ECF1]">
            <Link href={hints.passwordResetLink}>Open reset link</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

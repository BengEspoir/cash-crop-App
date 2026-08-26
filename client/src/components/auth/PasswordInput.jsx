"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

export const PasswordInput = forwardRef(function PasswordInput({
  label = "Password",
  error,
  helper,
  appearance = "default",
  inputClassName,
  ...props
}, ref) {
  const [visible, setVisible] = useState(false);
  const isReference = appearance === "reference";

  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          type={visible ? "text" : "password"}
          className={cn(
            "pr-10",
            isReference && "h-12 border-transparent bg-[#F6F7F6] focus:border-[#1E5E27] focus:ring-2 focus:ring-[#1E5E27]/10",
            inputClassName,
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-3 inline-flex items-center text-[#6B7280] hover:text-[#1E5E27]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {helper ? <p className="mt-2 text-[12px] text-[#6B7280]">{helper}</p> : null}
      {error ? <p className="mt-2 text-[12px] text-[#922B21]">{error}</p> : null}
    </div>
  );
});

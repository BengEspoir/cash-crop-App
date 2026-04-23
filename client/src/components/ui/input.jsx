import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const inputClasses =
  "h-11 w-full rounded-[10px] border border-ink-300 bg-white px-3 text-[14px] text-ink-800 outline-none transition-all duration-200 placeholder:text-ink-400 focus:border-green-800 focus:ring-4 focus:ring-green-800/10 disabled:cursor-not-allowed disabled:bg-ink-50";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(inputClasses, className)} {...props} />;
});

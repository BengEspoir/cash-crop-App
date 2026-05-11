import { cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "../../lib/utils";

const variants = {
  primary: "border-transparent bg-[#2E8B57] text-white shadow-[0_16px_30px_rgba(26,107,60,0.18)] hover:brightness-110",
  secondary: "border-transparent bg-[#FFB547] text-white shadow-[0_12px_24px_rgba(255,181,71,0.22)] hover:bg-[#F59E0B]",
  outline: "border-[1.5px] border-[#1A6B3C] bg-white text-[#1A6B3C] hover:bg-[#EAF4EE]",
  danger: "border-transparent bg-[#C0392B] text-white hover:bg-[#A93226]",
  ghost: "border-transparent bg-transparent text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A6B3C]",
};

const baseClasses = "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] border px-4 text-[13px] font-semibold leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50";

export const Button = forwardRef(function Button(
  { asChild = false, className, variant = "primary", type = "button", children, ...props },
  ref,
) {
  const classes = cn(baseClasses, variants[variant], className);

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: cn(classes, children.props.className),
      ref,
      ...props,
    });
  }

  return (
    <button ref={ref} type={type} className={classes} {...props}>
      {children}
    </button>
  );
});

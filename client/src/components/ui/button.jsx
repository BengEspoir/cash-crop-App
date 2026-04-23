import { cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "../../lib/utils";

const variants = {
  primary:
    "border-transparent bg-green-800 text-white shadow-soft hover:bg-green-700 hover:shadow-glow active:scale-[0.98]",
  secondary:
    "border border-ink-300 bg-white text-ink-700 hover:border-green-800 hover:text-green-800 active:scale-[0.98]",
  outline:
    "border-[1.5px] border-green-800 bg-white text-green-800 hover:bg-green-100 active:scale-[0.98]",
  danger:
    "border-transparent bg-[#C0392B] text-white hover:bg-[#A93226] active:scale-[0.98]",
  ghost:
    "border-transparent bg-transparent text-ink-500 hover:bg-ink-100 hover:text-green-800",
};

const baseClasses =
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border px-4 text-[13px] font-semibold leading-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-800/15 disabled:cursor-not-allowed disabled:opacity-50";

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

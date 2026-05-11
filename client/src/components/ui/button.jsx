import { cloneElement, forwardRef, isValidElement } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const variants = {
  primary:
    "border-transparent bg-green-800 text-white shadow-soft hover:bg-green-700 hover:shadow-glow active:scale-[0.98]",
  cta:
    "border-transparent bg-green-800 text-white shadow-[0_4px_14px_rgba(26,107,60,0.35)] hover:bg-green-700 hover:shadow-[0_6px_20px_rgba(26,107,60,0.45)] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0",
  secondary:
    "border border-ink-300 bg-white text-ink-700 hover:border-green-800 hover:text-green-800 active:scale-[0.98]",
  "secondary-ghost":
    "border border-ink-200 bg-transparent text-ink-600 hover:border-green-800/40 hover:text-green-800 hover:bg-green-50/50 active:scale-[0.98]",
  outline:
    "border-[1.5px] border-green-800 bg-white text-green-800 hover:bg-green-100 active:scale-[0.98]",
  danger:
    "border-transparent bg-[#C0392B] text-white hover:bg-[#A93226] active:scale-[0.98]",
  ghost:
    "border-transparent bg-transparent text-ink-500 hover:bg-ink-100 hover:text-green-800",
  "accent-gold":
    "border-transparent bg-gold-500 text-white shadow-soft hover:bg-gold-600 hover:shadow-glow-gold active:scale-[0.98]",
};

const sizes = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-[12px]",
  md: "h-10 gap-2 rounded-[10px] px-4 text-[13px]",
  lg: "h-12 gap-2.5 rounded-xl px-6 text-[14px]",
  xl: "h-14 gap-3 rounded-xl px-8 text-[15px]",
};

const baseClasses =
  "group inline-flex items-center justify-center whitespace-nowrap font-semibold leading-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-800/15 disabled:cursor-not-allowed disabled:opacity-50";

export const Button = forwardRef(function Button(
  {
    asChild = false,
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    icon: Icon,
    iconRight = false,
    type = "button",
    children,
    ...props
  },
  ref,
) {
  const classes = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    isLoading && "relative",
    className,
  );

  const content = (
    <>
      {isLoading && (
        <Loader2 className={cn("h-4 w-4 animate-spin", children && "absolute opacity-0")} />
      )}
      {Icon && !iconRight && (
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            variant === "cta" && "group-hover:translate-x-0.5",
          )}
        />
      )}
      {children && <span className={cn(isLoading && "opacity-0")}>{children}</span>}
      {Icon && iconRight && (
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            variant === "cta" && "group-hover:translate-x-1",
          )}
        />
      )}
    </>
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: cn(classes, children.props.className),
      ref,
      ...props,
    });
  }

  return (
    <button ref={ref} type={type} className={classes} disabled={isLoading || props.disabled} {...props}>
      {content}
    </button>
  );
});

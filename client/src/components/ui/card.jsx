"use client";

import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

/**
 * Card — Commerce card system with interactive variants
 *
 * Variants:
 * - default: standard card with soft shadow
 * - interactive: hover lift, border glow, shadow expansion
 * - highlighted: gold accent border for featured/promoted
 * - elevated: stronger shadow, no hover animation
 * - flat: no border, no shadow, clean background
 */

const variantStyles = {
  default: "border border-ink-200 bg-white shadow-soft",
  interactive:
    "group border border-ink-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-green-800/20 hover:shadow-[0_8px_28px_rgba(17,24,39,0.1)] hover:shadow-green-800/5 active:scale-[0.99]",
  highlighted:
    "border-2 border-gold-400/60 bg-white shadow-[0_4px_16px_rgba(181,137,42,0.1)]",
  elevated: "border border-ink-200 bg-white shadow-lift",
  flat: "border-0 bg-transparent shadow-none",
};

export function Card({
  className,
  variant = "default",
  asMotion = false,
  elevated = false,
  ...props
}) {
  const effectiveVariant = elevated ? "elevated" : variant;
  const classes = cn(
    "rounded-2xl overflow-hidden transition-shadow duration-200",
    variantStyles[effectiveVariant],
    className,
  );

  if (asMotion) {
    return <motion.div className={classes} {...props} />;
  }

  return <div className={classes} {...props} />;
}

/**
 * CardImage — Image with hover zoom
 */
export function CardImage({ className, src, alt, aspectRatio = "aspect-[4/3]", zoomOnHover = true, overlay, ...props }) {
  return (
    <div className={cn("relative overflow-hidden", aspectRatio, className)}>
      <img
        src={src}
        alt={alt}
        className={cn(
          "h-full w-full object-cover",
          zoomOnHover && "transition-transform duration-500 ease-out group-hover:scale-[1.04]",
        )}
        {...props}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      )}
    </div>
  );
}

/**
 * CardHeader — Structured card header
 */
export function CardHeader({ className, children }) {
  return <div className={cn("px-5 pt-5", className)}>{children}</div>;
}

/**
 * CardBody — Main content area
 */
export function CardBody({ className, children }) {
  return <div className={cn("px-5 py-3", className)}>{children}</div>;
}

/**
 * CardFooter — Bottom action area
 */
export function CardFooter({ className, children, divider = true }) {
  return (
    <div
      className={cn(
        "px-5 pb-5 pt-3",
        divider && "border-t border-ink-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * CardBadgeOverlay — Floating badge on top of image
 */
export function CardBadgeOverlay({ className, children, position = "top-left" }) {
  const positions = {
    "top-left": "left-3 top-3",
    "top-right": "right-3 top-3",
    "bottom-left": "left-3 bottom-3",
    "bottom-right": "right-3 bottom-3",
  };

  return (
    <div className={cn("absolute z-10", positions[position], className)}>
      {children}
    </div>
  );
}


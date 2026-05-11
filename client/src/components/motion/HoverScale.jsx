"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/**
 * HoverScale — Wrapper that adds subtle scale on hover
 * Useful for cards, buttons, icons.
 */
export function HoverScale({
  children,
  className,
  scale = 1.02,
  duration = 0.2,
  as: Component = motion.div,
  ...props
}) {
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    return <Component className={className} {...props}>{children}</Component>;
  }

  return (
    <Component
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * PressScale — Subtle press feedback for buttons and interactive items
 */
export function PressScale({ children, className, scale = 0.97, duration = 0.1, ...props }) {
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    return <div className={className} {...props}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      transition={{ duration, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

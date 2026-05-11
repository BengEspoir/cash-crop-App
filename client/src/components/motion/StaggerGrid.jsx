"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/**
 * StaggerGrid — Grid container with staggered child animations
 */
export function StaggerGrid({
  children,
  className,
  delay = 0.05,
  stagger = 0.06,
  ...props
}) {
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    return <div className={className} {...props}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGridItem({ children, className, ...props }) {
  const reduce = usePrefersReducedMotion();

  if (reduce) {
    return <div className={className} {...props}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

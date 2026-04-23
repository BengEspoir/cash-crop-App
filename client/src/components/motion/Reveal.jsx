"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

/**
 * Fade + rise reveal on mount or on-scroll. Respects reduced-motion.
 */
export function Reveal({
  as: Component = "div",
  children,
  className,
  delay = 0,
  y = 12,
  once = true,
  inView = true,
  duration = 0.5,
  ...rest
}) {
  const reduce = usePrefersReducedMotion();
  const Motion = motion[Component] ?? motion.div;

  if (reduce) {
    return (
      <Component className={className} {...rest}>
        {children}
      </Component>
    );
  }

  const initial = { opacity: 0, y };
  const animate = { opacity: 1, y: 0 };
  const transition = { duration, delay, ease: [0.22, 1, 0.36, 1] };

  if (inView) {
    return (
      <Motion
        className={className}
        initial={initial}
        whileInView={animate}
        viewport={{ once, amount: 0.2 }}
        transition={transition}
        {...rest}
      >
        {children}
      </Motion>
    );
  }

  return (
    <Motion className={className} initial={initial} animate={animate} transition={transition} {...rest}>
      {children}
    </Motion>
  );
}

/**
 * Staggered container. Children animate in one after another.
 */
export function Stagger({ as: Component = "div", children, className, delay = 0.05, stagger = 0.06, ...rest }) {
  const reduce = usePrefersReducedMotion();
  const Motion = motion[Component] ?? motion.div;

  if (reduce) {
    return (
      <Component className={className} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <Motion
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </Motion>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerItem({ as: Component = "div", children, className, ...rest }) {
  const reduce = usePrefersReducedMotion();
  const Motion = motion[Component] ?? motion.div;

  if (reduce) {
    return (
      <Component className={className} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <Motion className={className} variants={itemVariants} {...rest}>
      {children}
    </Motion>
  );
}

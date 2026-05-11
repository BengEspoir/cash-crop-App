"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * CountUp — Animated number counter
 * Triggers when scrolled into view, respects reduced motion.
 */
export function CountUp({
  end,
  start = 0,
  duration = 1500,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  separator = ",",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(start);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !isInView) {
      setValue(end);
      return;
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;

      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isInView, end, start, duration]);

  const formatNumber = (num) => {
    const fixed = num.toFixed(decimals);
    if (!separator) return fixed;
    const [intPart, decPart] = fixed.split(".");
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decPart ? `${formatted}.${decPart}` : formatted;
  };

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(value)}
      {suffix}
    </span>
  );
}

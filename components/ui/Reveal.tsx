"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Fade/raise on enter. Opacity + transform only; no motion if reduced. */
export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={className}
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.7, delay, ease: [0.215, 0.61, 0.355, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

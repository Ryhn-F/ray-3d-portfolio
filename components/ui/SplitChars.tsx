"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { intro } from "@/lib/intro";

/**
 * Per-character mask reveal (own splitter; no paid plugin). Content stays
 * readable if JS fails and for screen readers via aria-label.
 */
export default function SplitChars({
  text,
  as = "span",
  className,
  stagger = 0.03,
  delay = 0,
  start = "top 90%",
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  stagger?: number;
  delay?: number;
  start?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const Tag = as as "h2"; // all allowed tags accept the same props here

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const chars = el.querySelectorAll(".sc-char");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.set(chars, { yPercent: 115 });
      let st: ScrollTrigger | undefined;
      const off = intro.onDone(() => {
        st = ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () =>
            gsap.to(chars, { yPercent: 0, duration: 1, ease: "expo.out", stagger, delay }),
        });
      });
      return () => {
        off();
        st?.kill();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} aria-label={text} className={className}>
      {text.split(" ").map((word, wi, arr) => (
        <span key={wi}>
          <span aria-hidden="true" className="sc-word">
            {word.split("").map((ch, ci) => (
              <span key={ci} className="sc-char">
                {ch}
              </span>
            ))}
          </span>
          {wi < arr.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Big outlined ticker whose speed (and direction) follows scroll velocity. */
export default function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!track.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const dir = reverse ? 1 : -1;
      const tween = gsap.fromTo(
        track.current,
        { xPercent: reverse ? -50 : 0 },
        { xPercent: reverse ? 0 : -50, duration: 38, ease: "none", repeat: -1 },
      );
      ScrollTrigger.create({
        trigger: track.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-3000, 3000, self.getVelocity());
          gsap.to(tween, { timeScale: 1 + (Math.abs(v) / 350) * (v * dir > 0 ? 1 : -0.6), duration: 0.25, overwrite: true });
          gsap.to(tween, { timeScale: 1, duration: 0.9, delay: 0.25, overwrite: "auto" });
        },
      });
    },
    { scope: track },
  );

  const row = items.map((t, i) => (
    <span key={i} className="mq-item">
      {t}
      <span className="mq-dot" aria-hidden="true" />
    </span>
  ));

  return (
    <div className="mq" aria-hidden="true">
      <div ref={track} className="mq-track">
        {row}
        {row}
      </div>
    </div>
  );
}

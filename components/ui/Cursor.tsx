"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Trailing ring cursor for fine pointers. The native cursor stays visible. */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ring.current!;
    const d = dot.current!;
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3.out" });
    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "none" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "none" });

    const move = (e: PointerEvent) => {
      document.documentElement.classList.add("has-cursor");
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const hot = (e.target as Element | null)?.closest("a,button,[role=button]");
      r.classList.toggle("is-hot", !!hot);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.classList.remove("has-cursor");
    };
  });

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}

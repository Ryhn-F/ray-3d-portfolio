"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { intro } from "@/lib/intro";
import { scrollState } from "@/lib/scroll-state";
import ReduceToggle from "@/components/ui/ReduceToggle";

const STOPS = ["Orbit", "Learnix", "Alumni Portal", "Kandara", "This site", "Contact"];

/** Fixed HUD: corner brackets, stop rail, scroll readout. DOM writes via refs, no React state. */
export default function Hud() {
  const phase = useSyncExternalStore(intro.subscribe, intro.getPhase, () => "loading" as const);
  const pct = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const dots = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const s = scrollState.stop;
      const near = Math.round(s);
      if (pct.current) pct.current.textContent = String(Math.round(scrollState.progress * 100)).padStart(3, "0");
      if (label.current) label.current.textContent = `${String(near + 1).padStart(2, "0")} / ${String(STOPS.length).padStart(2, "0")} — ${STOPS[near]}`;
      if (bar.current) bar.current.style.transform = `scaleY(${scrollState.progress})`;
      dots.current.forEach((d, i) => d?.toggleAttribute("data-active", i === near));
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="hud" data-visible={phase === "done"} aria-hidden="false">
      <i className="hud-corner tl" aria-hidden="true" />
      <i className="hud-corner tr" aria-hidden="true" />
      <i className="hud-corner bl" aria-hidden="true" />
      <i className="hud-corner br" aria-hidden="true" />

      <div className="hud-rail" aria-hidden="true">
        <span className="hud-rail-line">
          <span ref={bar} />
        </span>
        <ol>
          {STOPS.map((s, i) => (
            <li key={s} ref={(el) => void (dots.current[i] = el)}>
              <b />
            </li>
          ))}
        </ol>
      </div>

      <div className="hud-bl mono-label" aria-hidden="true">
        <span>Scroll</span> <span ref={pct}>000</span>
        <span>%</span>
      </div>
      <div className="hud-bc mono-label" aria-hidden="true">
        <span ref={label}>01 / 06 — Orbit</span>
      </div>
      <div className="hud-br">
        <ReduceToggle />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { intro } from "@/lib/intro";
import { scrollState } from "@/lib/scroll-state";

const MIN_MS = 2400; // keep the loader on screen long enough to read, even on fast machines
const FAILSAFE_MS = 10000; // never trap the visitor behind the loader

function Digit({ d }: { d: number }) {
  return (
    <span className="sp-digit" aria-hidden="true">
      <span className="sp-strip" style={{ transform: `translateY(${-d * 10}%)` }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  );
}

const LOG: [string, string, string][] = [
  ["fonts", "typefaces", "ready"],
  ["tier", "device profile", "calibrated"],
  ["scene", "city · shaders", "compiled"],
];

export default function Splash() {
  const phase = useSyncExternalStore(intro.subscribe, intro.getPhase, () => "loading" as const);
  const target = useSyncExternalStore(intro.subscribe, intro.getTarget, () => 0);
  const steps = useSyncExternalStore(intro.subscribe, intro.getSteps, () => "");
  const [shown, setShown] = useState(0);
  const [minDone, setMinDone] = useState(false);
  const [clock, setClock] = useState("--:--:--");
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const counter = useRef({ v: 0 });

  // Lock scroll while the splash is up.
  useEffect(() => {
    if (phase === "done") {
      document.documentElement.classList.remove("is-locked");
      return;
    }
    document.documentElement.classList.add("is-locked");
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    return () => document.documentElement.classList.remove("is-locked");
  }, [phase]);

  // Real load signals + safety nets.
  useEffect(() => {
    document.fonts?.ready.then(() => intro.mark("fonts"));
    const min = window.setTimeout(() => setMinDone(true), MIN_MS);
    const safe = window.setTimeout(() => intro.markAll(), FAILSAFE_MS);
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Jakarta",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(new Date()),
      );
    tick();
    const clockId = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(min);
      window.clearTimeout(safe);
      window.clearInterval(clockId);
    };
  }, []);

  // Smoothly chase the real progress.
  useGSAP(
    () => {
      gsap.to(counter.current, {
        v: target * 100,
        duration: 1.1,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => setShown(Math.round(counter.current.v)),
      });
    },
    { dependencies: [target] },
  );

  // Ready once the counter hit 100 and the minimum time has passed.
  useEffect(() => {
    if (phase === "loading" && shown >= 100 && minDone) intro.setReady();
  }, [phase, shown, minDone]);

  useEffect(() => {
    if (phase === "ready") btn.current?.focus();
  }, [phase]);

  // Exit: letters slide up, the whole screen wipes away, camera swoops in.
  useGSAP(
    () => {
      if (phase !== "entering") return;
      const tl = gsap.timeline({ onComplete: () => intro.finish() });
      tl.to(".sp-ui", { opacity: 0, duration: 0.35, ease: "power2.out" }, 0)
        .to(".sp-line > span", { yPercent: -120, duration: 0.9, ease: "power4.in", stagger: 0.08 }, 0.05)
        .to(".sp-cube", { scale: 0.2, opacity: 0, duration: 0.7, ease: "power3.in" }, 0.05)
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 1.0, ease: "power4.inOut" }, 0.55);
    },
    { dependencies: [phase] },
  );

  // Camera swoop. Kept outside the gsap context on purpose: unmounting the
  // splash would otherwise revert scrollState.intro back to 0.
  useEffect(() => {
    if (phase !== "entering") return;
    gsap.to(scrollState, { intro: 1, duration: 3.6, ease: "none", delay: 0.35, overwrite: true });
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && intro.getPhase() === "ready") intro.enter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (phase === "done") return null;

  const pct = String(Math.min(100, shown)).padStart(3, "0");
  const ready = phase === "ready" || phase === "entering";
  const done = new Set(steps.split(",").filter(Boolean));

  return (
    <div ref={root} className="splash" role="dialog" aria-modal="true" aria-label="Loading portfolio">
      <div className="sp-grid" aria-hidden="true" />
      <div className="sp-scan" aria-hidden="true" />

      <div className="sp-ui sp-top mono-label">
        <span className="flex items-center gap-3">
          <span className="sp-counter" aria-label={`${shown} percent loaded`}>
            <Digit d={Number(pct[0])} />
            <Digit d={Number(pct[1])} />
            <Digit d={Number(pct[2])} />
            <span aria-hidden="true">%</span>
          </span>
          <span>{ready ? "Loaded" : "Loading"}</span>
        </span>
        <span className="hidden sm:inline">RF — PORTFOLIO ©2026</span>
        <span>JAKARTA {clock} WIB</span>
      </div>

      <div className="sp-cube sp-ui" aria-hidden="true">
        <div className="cube">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <h1 className="sp-name" aria-label="Rayhan Firdaus">
        <span className="sp-line" aria-hidden="true">
          <span>RAYHAN</span>
        </span>
        <span className="sp-line sp-outline" aria-hidden="true">
          <span>FIRDAUS</span>
        </span>
      </h1>

      <div className="sp-ui sp-bottom">
        <ul className="mono-label sp-log" aria-hidden="true">
          {LOG.map(([key, label, ok]) => (
            <li key={key} data-ok={done.has(key)}>
              <span>{done.has(key) ? "[ ok ]" : "[ .. ]"}</span> {label}
              {done.has(key) ? ` — ${ok}` : ""}
            </li>
          ))}
        </ul>

        <div className="sp-cta">
          <p className="mono-label sp-hint">{ready ? "Everything is ready" : "Building the city…"}</p>
          <button
            ref={btn}
            type="button"
            className="sp-enter"
            disabled={phase !== "ready"}
            onClick={() => intro.enter()}
          >
            <span>Enter the city</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div className="sp-bar" aria-hidden="true">
        <span style={{ transform: `scaleX(${shown / 100})` }} />
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useState } from "react";
import { REDUCE_EVENT, getTier, type Tier } from "@/lib/capability";
import { intro } from "@/lib/intro";
import { sceneStats, scrollState } from "@/lib/scroll-state";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Mounts the single persistent canvas after first paint, only if the device
 * qualifies. The CSS <Poster/> underneath is always the fallback.
 */
export default function SceneRoot() {
  const [tier, setTier] = useState<Tier | null>(null);

  useEffect(() => {
    // Debug hook for visual QA: add ?debug to the URL.
    if (new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as { __city: typeof scrollState }).__city = scrollState;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => {
      const t = getTier();
      intro.mark("tier");
      if (t === "static") {
        sceneStats.active = false;
        scrollState.intro = 1; // if 3D is enabled later, don't replay the swoop
        intro.skip(); // no 3D → no splash, content right away
      }
      setTier(t);
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (w.requestIdleCallback) w.requestIdleCallback(evaluate, { timeout: 600 });
    else window.setTimeout(evaluate, 150);
    mq.addEventListener("change", evaluate);
    window.addEventListener(REDUCE_EVENT, evaluate);
    return () => {
      mq.removeEventListener("change", evaluate);
      window.removeEventListener(REDUCE_EVENT, evaluate);
    };
  }, []);

  if (!tier || tier === "static") return null;

  const fail = () => {
    sceneStats.active = false;
    scrollState.intro = 1;
    intro.skip();
    setTier("static");
  };

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" role="presentation">
      <Boundary onError={fail}>
        <Scene tier={tier} onFail={fail} />
      </Boundary>
    </div>
  );
}

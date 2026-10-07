"use client";

import { useEffect, useState } from "react";
import { sceneStats } from "@/lib/scroll-state";

type Snap = typeof sceneStats;

/** Live readout from the real renderer. Shows "off" when the canvas isn't running. */
export default function LabStats() {
  const [s, setS] = useState<Snap | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setS({ ...sceneStats }), 500);
    return () => window.clearInterval(id);
  }, []);

  const rows: [string, string][] =
    !s || !s.active
      ? [["3D scene", "off (static fallback)"]]
      : [
          ["tier", s.tier],
          ["fps", s.fps ? String(s.fps) : "idle"],
          ["draw calls", String(s.calls)],
          ["triangles", s.triangles.toLocaleString()],
          ["geometries", String(s.geometries)],
          ["dpr", s.dpr.toFixed(2)],
        ];

  return (
    <dl
      className="mt-5 grid max-w-xs grid-cols-2 gap-x-6 gap-y-1 border-l border-accent/60 pl-4 font-mono text-xs"
      aria-label="Live renderer stats"
    >
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-dim">{k}</dt>
          <dd className="text-right text-accent">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

import { Color, Vector4 } from "three";
import { projects } from "@/data/projects";
import { scrollState } from "@/lib/scroll-state";
import { COLORS } from "./shaders";

// Shared uniform objects: one update per frame, read by every material.
export const shared = {
  time: { value: 0 },
  fx: { value: 1 },
  district: projects.map((p) => new Vector4(p.center[0], p.center[1], 0, 0)),
  fogColor: { value: new Color(COLORS.bg) },
  cyan: { value: new Color(COLORS.cyan) },
  violet: { value: new Color(COLORS.violet) },
  mint: { value: new Color(COLORS.mint) },
};

export const FOG_NEAR = 80;
export const FOG_FAR = 300;

/** Smoothed per-district weights (stop proximity + skill hover). */
export const weights = projects.map(() => ({ stop: 0, hover: 0 }));

export function updateShared(time: number, dt: number) {
  shared.time.value = time;
  projects.forEach((p, i) => {
    const stopTarget = Math.max(0, 1 - Math.abs(scrollState.stop - (i + 1)));
    const hoverTarget = scrollState.hover.has(p.id) ? 1 : 0;
    const w = weights[i];
    const k = 1 - Math.exp(-dt * 6);
    w.stop += (stopTarget - w.stop) * k;
    w.hover += (hoverTarget - w.hover) * k;
    shared.district[i].set(p.center[0], p.center[1], w.stop, w.hover);
  });
}

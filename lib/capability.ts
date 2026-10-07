export type Tier = "full" | "lite" | "static";

export const REDUCE_KEY = "reduce-effects";
export const REDUCE_EVENT = "reduce-effects-change";

type NavExtra = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export function readReduceToggle(): boolean {
  try {
    return localStorage.getItem(REDUCE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeReduceToggle(on: boolean) {
  try {
    localStorage.setItem(REDUCE_KEY, on ? "1" : "0");
  } catch {
    /* storage unavailable: still notify listeners */
  }
  window.dispatchEvent(new Event(REDUCE_EVENT));
}

function hasWebGL2(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

/** Synchronous, client-only capability gate. */
export function getTier(): Tier {
  if (readReduceToggle()) return "static";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  const nav = navigator as NavExtra;
  if (nav.connection?.saveData) return "static";
  if (!hasWebGL2()) return "static";
  if ((nav.deviceMemory ?? 8) <= 2) return "static";
  if ((nav.hardwareConcurrency ?? 8) <= 2) return "static";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const lowMem = (nav.deviceMemory ?? 8) <= 4;
  if (coarse || lowMem || window.innerWidth < 768) return "lite";
  return "full";
}

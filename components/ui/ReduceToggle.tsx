"use client";

import { useSyncExternalStore } from "react";
import { REDUCE_EVENT, readReduceToggle, writeReduceToggle } from "@/lib/capability";

function subscribe(cb: () => void) {
  window.addEventListener(REDUCE_EVENT, cb);
  return () => window.removeEventListener(REDUCE_EVENT, cb);
}

export default function ReduceToggle() {
  const on = useSyncExternalStore(subscribe, readReduceToggle, () => false);

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => writeReduceToggle(!on)}
      className="mono-label rounded-full border border-line px-3 py-1.5 hover:border-accent hover:text-accent"
    >
      Reduce effects: {on ? "on" : "off"}
    </button>
  );
}

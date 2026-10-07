"use client";

import { useEffect, useState } from "react";

export default function RotatingWords({ words }: { words: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), 2200);
    return () => window.clearInterval(id);
  }, [words.length]);

  return (
    <span className="mono-label inline-flex items-center gap-3 text-accent" aria-live="off">
      <span className="inline-block h-px w-8 bg-accent" aria-hidden="true" />
      {words[i]}
      <span className="inline-block h-3 w-1.5 animate-pulse bg-accent" aria-hidden="true" />
    </span>
  );
}

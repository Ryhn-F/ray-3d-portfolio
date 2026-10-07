"use client";

import { useGSAP, ScrollTrigger } from "@/lib/gsap";
import { scrollState } from "@/lib/scroll-state";
import { STOP_COUNT } from "./camera-path";

/**
 * Maps window scroll to a continuous scene stop by interpolating between the
 * vertical centers of every [data-stop] element (in DOM order).
 */
export default function ScrollDriver() {
  useGSAP(() => {
    let centers: number[] = [];

    const measure = () => {
      const els = Array.from(document.querySelectorAll<HTMLElement>("[data-stop]"));
      centers = els.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2 - window.innerHeight / 2;
      });
    };

    const update = () => {
      const y = window.scrollY;
      const n = centers.length;
      let stop = 0;
      if (n > 1) {
        if (y <= centers[0]) stop = 0;
        else if (y >= centers[n - 1]) stop = n - 1;
        else {
          for (let i = 0; i < n - 1; i++) {
            if (y < centers[i + 1]) {
              stop = i + (y - centers[i]) / (centers[i + 1] - centers[i]);
              break;
            }
          }
        }
      }
      scrollState.stop = Math.min(STOP_COUNT - 1, stop);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollState.progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    };

    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: update,
      onRefresh: () => {
        measure();
        update();
      },
    });

    measure();
    update();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  });

  return null;
}

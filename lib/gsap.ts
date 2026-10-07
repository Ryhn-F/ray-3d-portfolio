import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register once, here only.
gsap.registerPlugin(useGSAP, ScrollTrigger);
// Keep tweens on wall-clock time even when a frame is slow (heavy 3D scene),
// otherwise the splash counter and intro swoop would crawl on weak devices.
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger, useGSAP };

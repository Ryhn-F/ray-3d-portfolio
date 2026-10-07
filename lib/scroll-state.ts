// Shared mutable state between DOM code (scroll, hover, intro) and the 3D scene.
// Never put this in React state: it changes every frame.
export const scrollState = {
  /** Continuous scene stop in [0, STOP_COUNT - 1]. */
  stop: 0,
  /** Overall page scroll 0..1. */
  progress: 0,
  /** Intro swoop 0 (far orbit, splash) → 1 (hero pose). Animated by Splash. */
  intro: 0,
  /** Project ids currently highlighted by skill hover. */
  hover: new Set<string>(),
  /** Set by the Canvas on mount so DOM code can request a frame. */
  invalidate: (() => {}) as () => void,
};

/** Live renderer stats for the "How this site is built" panel. */
export const sceneStats = {
  active: false,
  fps: 0,
  calls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  dpr: 1,
  tier: "static" as string,
};

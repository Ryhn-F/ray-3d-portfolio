// Motion tokens. Mirrored as CSS vars in app/globals.css.
export const ease = {
  out: "power3.out", // cubic-bezier(.215,.61,.355,1)
  inOut: "power2.inOut", // cubic-bezier(.45,0,.55,1)
  expo: "expo.out",
  scrub: "none",
} as const;

export const dur = { micro: 0.15, ui: 0.3, reveal: 0.7, hero: 1.2 } as const;
export const stagger = { text: 0.04, cards: 0.08 } as const;

export const cssEase = {
  out: [0.215, 0.61, 0.355, 1],
  inOut: [0.45, 0, 0.55, 1],
} as const;

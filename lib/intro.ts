// Tiny external store for the splash/intro sequence.
// phase: loading → ready (button shown) → entering (exit anim + camera swoop) → done
export type Phase = "loading" | "ready" | "entering" | "done";
export type Step = "fonts" | "tier" | "scene";

const WEIGHTS: Record<Step, number> = { fonts: 0.25, tier: 0.25, scene: 0.5 };

let phase: Phase = "loading";
const done = new Set<Step>();
let target = 0;
let stepsKey = "";
const subs = new Set<() => void>();
const doneCbs = new Set<() => void>();

const emit = () => subs.forEach((f) => f());

function setPhase(p: Phase) {
  if (phase === p) return;
  phase = p;
  if (p === "done") {
    doneCbs.forEach((cb) => cb());
    doneCbs.clear();
  }
  emit();
}

export const intro = {
  subscribe(cb: () => void) {
    subs.add(cb);
    return () => {
      subs.delete(cb);
    };
  },
  getPhase: (): Phase => phase,
  /** 0..1 real loading progress (fonts + tier decided + first 3D frame). */
  getTarget: (): number => target,
  /** Stable string of completed steps, e.g. "fonts,scene" (for boot-log lines). */
  getSteps: (): string => stepsKey,
  mark(step: Step) {
    if (done.has(step)) return;
    done.add(step);
    stepsKey = [...done].sort().join(",");
    target = Math.min(1, [...done].reduce((a, s) => a + WEIGHTS[s], 0));
    emit();
  },
  markAll() {
    (Object.keys(WEIGHTS) as Step[]).forEach((s) => intro.mark(s));
  },
  setReady() {
    if (phase === "loading") setPhase("ready");
  },
  enter() {
    if (phase === "ready") setPhase("entering");
  },
  finish() {
    setPhase("done");
  },
  /** Skip the whole splash (static tier / reduced motion / no WebGL). */
  skip() {
    intro.markAll();
    setPhase("done");
  },
  /** Run cb once the intro is finished (immediately if it already is). */
  onDone(cb: () => void) {
    if (phase === "done") {
      cb();
      return () => {};
    }
    doneCbs.add(cb);
    return () => {
      doneCbs.delete(cb);
    };
  },
};

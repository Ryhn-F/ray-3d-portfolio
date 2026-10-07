import { CatmullRomCurve3, Vector3 } from "three";

type Key = { pos: [number, number, number]; look: [number, number, number] };

// One keyframe per scene stop (data-stop elements, in DOM order):
// 0 hero, 1..4 districts (projects.ts order), 5 closing overview.
// Aerial camera: ~45-50 deg down-tilt at district stops.
export const KEYS: Key[] = [
  { pos: [0, 46, 58], look: [0, 0, 0] },
  { pos: [-26, 27, 21], look: [-26, 2, -4] },
  { pos: [-9, 27, 31], look: [-9, 2, 6] },
  { pos: [9, 27, 21], look: [9, 2, -4] },
  { pos: [26, 27, 31], look: [26, 2, 6] },
  { pos: [6, 44, 62], look: [0, 0, 0] },
];

export const STOP_COUNT = KEYS.length;

const posCurve = new CatmullRomCurve3(
  KEYS.map((k) => new Vector3(...k.pos)),
  false,
  "centripetal",
);
const lookCurve = new CatmullRomCurve3(
  KEYS.map((k) => new Vector3(...k.look)),
  false,
  "centripetal",
);

/** stop in [0, STOP_COUNT - 1]; passes exactly through each keyframe at integer stops. */
export function sampleCamera(stop: number, outPos: Vector3, outLook: Vector3) {
  const t = Math.min(1, Math.max(0, stop / (STOP_COUNT - 1)));
  posCurve.getPoint(t, outPos);
  lookCurve.getPoint(t, outLook);
}

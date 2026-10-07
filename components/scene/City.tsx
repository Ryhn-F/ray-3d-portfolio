"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type InstancedMesh, Object3D } from "three";
import { projects } from "@/data/projects";
import { buildingFrag, buildingVert, groundFrag, groundVert } from "./shaders";
import { FOG_FAR, FOG_NEAR, shared, updateShared } from "./uniforms";

const SPACING = 2.4;
const PLAZA_R = 4.6;

// Deterministic PRNG so every load builds the same city.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Cell = { x: number; z: number; w: number; d: number; h: number; tint: number; hue: number };

function buildCells(keep: number, maxCount: number): Cell[] {
  const rand = mulberry32(20261007);
  const cells: Cell[] = [];
  for (let gx = -38; gx <= 38; gx++) {
    for (let gz = -20; gz <= 20; gz++) {
      const r1 = rand(); // always consume so density changes don't reshuffle the city
      const r2 = rand();
      const r3 = rand();
      const r4 = rand();
      if (gx % 6 === 0 || gz % 6 === 0) continue; // roads
      if (r1 > keep) continue;
      const x = gx * SPACING;
      const z = gz * SPACING;
      let nearest = Infinity;
      for (const p of projects) {
        nearest = Math.min(nearest, Math.hypot(x - p.center[0], z - p.center[1]));
      }
      if (nearest < PLAZA_R) continue; // plaza around each landmark
      const falloff = Math.max(0, 1 - Math.hypot(x / 90, z / 45));
      let h = 0.6 + Math.pow(r2, 2.0) * (2.5 + falloff * 8);
      if (nearest < 10) h = Math.min(h, 2.2); // keep landmarks readable from the aerial camera
      cells.push({
        x,
        z,
        w: 1.1 + r3 * 0.85,
        d: 1.1 + r4 * 0.85,
        h,
        tint: nearest < 14 ? 1 - nearest / 14 : 0,
        hue: r3 > 0.8 ? 1 : 0,
      });
      if (cells.length >= maxCount) return cells;
    }
  }
  return cells;
}

const dummy = new Object3D();
const tmp = new Color();

function Buildings({ keep, maxCount }: { keep: number; maxCount: number }) {
  const ref = useRef<InstancedMesh>(null);
  const cells = useMemo(() => buildCells(keep, maxCount), [keep, maxCount]);
  const uniforms = useMemo(
    () => ({
      uTime: shared.time,
      uFx: shared.fx,
      uFogColor: shared.fogColor,
      uFogNear: { value: FOG_NEAR },
      uFogFar: { value: FOG_FAR },
      uCyan: shared.cyan,
      uViolet: shared.violet,
      uD: { value: shared.district },
    }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    cells.forEach((c, i) => {
      dummy.position.set(c.x, c.h / 2, c.z);
      dummy.scale.set(c.w, c.h, c.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      // r = brightness variance, g = violet-edge bias, b unused
      tmp.setRGB(0.3 + c.tint * 0.7, c.hue * 0.25 + c.tint * 0.1, 0);
      mesh.setColorAt(i, tmp);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cells]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cells.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial vertexShader={buildingVert} fragmentShader={buildingFrag} uniforms={uniforms} />
    </instancedMesh>
  );
}

function Ground() {
  const uniforms = useMemo(
    () => ({
      uTime: shared.time,
      uFogColor: shared.fogColor,
      uFogNear: { value: FOG_NEAR },
      uFogFar: { value: FOG_FAR },
      uCyan: shared.cyan,
      uMint: shared.mint,
      uD: { value: shared.district },
    }),
    [],
  );
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
      <planeGeometry args={[500, 500]} />
      <shaderMaterial vertexShader={groundVert} fragmentShader={groundFrag} uniforms={uniforms} />
    </mesh>
  );
}

/** Drives shared uniforms once per frame. */
function Uniforms({ fx }: { fx: boolean }) {
  useFrame(({ clock }, dt) => {
    updateShared(clock.elapsedTime, dt);
    shared.fx.value = fx ? 1 : 0;
  });
  return null;
}

export default function City({
  keep,
  maxBuildings,
  fx,
}: {
  keep: number;
  maxBuildings: number;
  fx: boolean;
}) {
  return (
    <>
      <Uniforms fx={fx} />
      <Ground />
      <Buildings keep={keep} maxCount={maxBuildings} />
    </>
  );
}

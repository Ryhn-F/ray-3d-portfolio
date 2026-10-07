"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BackSide, BufferAttribute, type Mesh } from "three";
import { dustFrag, dustVert, skyFrag, skyVert } from "./shaders";
import { shared } from "./uniforms";

function Sky() {
  const ref = useRef<Mesh>(null);
  const uniforms = useMemo(() => ({ uTime: shared.time, uBg: shared.fogColor }), []);
  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position);
  });
  return (
    <mesh ref={ref} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[100, 32, 16]} />
      <shaderMaterial
        vertexShader={skyVert}
        fragmentShader={skyFrag}
        uniforms={uniforms}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Dust({ count }: { count: number }) {
  const { pos, seed, uniforms } = useMemo(() => {
    const r = mulberry32(777);
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (r() - 0.5) * 130;
      p[i * 3 + 1] = r() * 34;
      p[i * 3 + 2] = (r() - 0.5) * 80;
      s[i * 4] = r();
      s[i * 4 + 1] = r();
      s[i * 4 + 2] = r();
      s[i * 4 + 3] = r();
    }
    return {
      pos: new BufferAttribute(p, 3),
      seed: new BufferAttribute(s, 4),
      uniforms: { uTime: shared.time, uPx: { value: 30 }, uColor: shared.cyan },
    };
  }, [count]);

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <primitive object={pos} attach="attributes-position" />
        <primitive object={seed} attach="attributes-aSeed" />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={dustVert}
        fragmentShader={dustFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export default function Atmosphere({ fx }: { fx: boolean }) {
  return (
    <>
      <Sky />
      {fx && <Dust count={450} />}
    </>
  );
}

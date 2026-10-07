"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  DoubleSide,
  type Group,
  type Material,
  type Mesh,
  type ShaderMaterial,
  Vector4,
} from "three";
import { projects } from "@/data/projects";
import {
  beamFrag,
  beamVert,
  COLORS,
  sparkFrag,
  sparkVert,
} from "./shaders";
import { shared, weights } from "./uniforms";

const LM_COLORS = [COLORS.cyan, COLORS.violet, COLORS.mint, COLORS.pink];
const BASE_Y = 6;

type Fade = Material & { opacity: number };

function Beam({ index, color }: { index: number; color: string }) {
  const uniforms = useMemo(
    () => ({ uTime: shared.time, uW: { value: 0 }, uColor: { value: new Color(color) } }),
    [color],
  );
  const mat = useRef<ShaderMaterial>(null);
  useFrame(() => {
    const w = weights[index];
    if (mat.current) mat.current.uniforms.uW.value = Math.max(w.stop, w.hover * 0.8);
  });
  return (
    <mesh position={[0, 30, 0]} frustumCulled={false}>
      <cylinderGeometry args={[1.1, 3.2, 60, 24, 1, true]} />
      <shaderMaterial
        ref={mat}
        vertexShader={beamVert}
        fragmentShader={beamFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        side={DoubleSide}
      />
    </mesh>
  );
}

function Shape({ id, color }: { id: string; color: string }) {
  const add = { transparent: true, blending: AdditiveBlending, depthWrite: false } as const;
  switch (id) {
    case "learnix": // AI: neural icosahedron
      return (
        <>
          <mesh userData-spin="y">
            <icosahedronGeometry args={[2.4, 1]} />
            <meshBasicMaterial color={color} wireframe transparent opacity={0.9} />
          </mesh>
          <mesh userData-spin="-y" scale={0.55}>
            <icosahedronGeometry args={[2.4, 0]} />
            <meshBasicMaterial color={color} opacity={0.4} {...add} />
          </mesh>
          <mesh userData-spin="x" rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[3.7, 0.03, 6, 72]} />
            <meshBasicMaterial color={color} opacity={0.8} {...add} />
          </mesh>
        </>
      );
    case "alumni": // portal
      return (
        <>
          <mesh userData-spin="y">
            <torusGeometry args={[2.6, 0.13, 10, 64]} />
            <meshBasicMaterial color={color} opacity={0.95} {...add} />
          </mesh>
          <mesh userData-spin="y">
            <circleGeometry args={[2.5, 40]} />
            <meshBasicMaterial color={color} opacity={0.12} side={DoubleSide} {...add} />
          </mesh>
          <mesh userData-spin="-y" rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[3.4, 0.03, 6, 64]} />
            <meshBasicMaterial color={color} opacity={0.7} {...add} />
          </mesh>
        </>
      );
    case "kandara": // company tower: stacked slabs
      return (
        <>
          {[
            [3.0, 1.6, 3.0, -2.4],
            [2.4, 1.6, 2.4, -0.7],
            [1.8, 1.6, 1.8, 1.0],
            [1.1, 1.6, 1.1, 2.7],
          ].map(([w, h, d, y], i) => (
            <mesh key={i} position={[0, y, 0]} userData-spin={i % 2 ? "y" : "-y"}>
              <boxGeometry args={[w, h, d]} />
              <meshBasicMaterial color={color} opacity={0.12} {...add} />
              <Edges color={color} />
            </mesh>
          ))}
        </>
      );
    default: // lab: tesseract
      return (
        <>
          <mesh userData-spin="y">
            <boxGeometry args={[3.4, 3.4, 3.4]} />
            <meshBasicMaterial color={color} opacity={0.06} {...add} />
            <Edges color={color} />
          </mesh>
          <mesh userData-spin="-y" rotation={[0.6, 0, 0.6]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshBasicMaterial color={color} opacity={0.1} {...add} />
            <Edges color={COLORS.cyan} />
          </mesh>
          <mesh userData-spin="x">
            <octahedronGeometry args={[0.9, 0]} />
            <meshBasicMaterial color="#d9c8ff" opacity={0.5} {...add} />
          </mesh>
        </>
      );
  }
}

function Landmark({ index, fx }: { index: number; fx: boolean }) {
  const p = projects[index];
  const color = LM_COLORS[index];
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const ring = useRef<Mesh>(null);

  useFrame(({ clock }, dt) => {
    const g = root.current;
    const b = body.current;
    if (!g || !b) return;
    const w = Math.max(weights[index].stop, weights[index].hover * 0.8);
    const t = clock.elapsedTime;
    b.position.y = BASE_Y + Math.sin(t * 0.9 + index) * 0.35 + w * 0.8;
    b.scale.setScalar(1 + w * 0.3 + Math.sin(t * 1.7 + index) * 0.02);
    b.children.forEach((c) => {
      const spin = (c.userData as { spin?: string }).spin;
      if (spin === "y") c.rotation.y += dt * (0.35 + w * 1.2);
      else if (spin === "-y") c.rotation.y -= dt * (0.5 + w * 1.4);
      else if (spin === "x") c.rotation.x += dt * (0.6 + w);
      c.traverse((o) => {
        const m = (o as Mesh).material as Fade | undefined;
        if (m && "opacity" in m) {
          const base = (m.userData as { base?: number }).base ?? (m.userData.base = m.opacity);
          m.opacity = base * (0.5 + 0.5 * w + 0.35);
        }
      });
    });
    if (ring.current) {
      const m = ring.current.material as Fade;
      const base = (m.userData as { base?: number }).base ?? (m.userData.base = m.opacity);
      m.opacity = base * (0.45 + w * 1.2);
      ring.current.rotation.z += dt * 0.25;
    }
  });

  return (
    <group ref={root} position={[p.center[0], 0, p.center[1]]}>
      <group ref={body} position={[0, BASE_Y, 0]}>
        <Shape id={p.id} color={color} />
      </group>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[3.7, 3.85, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[2.2, 2.26, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      {fx && <Beam index={index} color={color} />}
    </group>
  );
}

/** All sparks in one draw call. */
function Sparks({ perDistrict }: { perDistrict: number }) {
  const { geometryAttr, uniforms } = useMemo(() => {
    const n = perDistrict * projects.length;
    const data = new Float32Array(n * 4);
    const pos = new Float32Array(n * 3);
    let k = 0;
    projects.forEach((p, i) => {
      for (let j = 0; j < perDistrict; j++, k++) {
        data[k * 4] = p.center[0];
        data[k * 4 + 1] = p.center[1];
        data[k * 4 + 2] = (j + 0.5) / perDistrict;
        data[k * 4 + 3] = i;
      }
    });
    return {
      geometryAttr: { pos: new BufferAttribute(pos, 3), data: new BufferAttribute(data, 4) },
      uniforms: {
        uTime: shared.time,
        uPx: { value: 28 },
        uW: { value: projects.map(() => new Vector4()) },
        uC: { value: LM_COLORS.map((c) => new Color(c)) },
      },
    };
  }, [perDistrict]);

  useFrame(() => {
    uniforms.uW.value.forEach((v, i) => v.set(Math.max(weights[i].stop, weights[i].hover * 0.8), 0, 0, 0));
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <primitive object={geometryAttr.pos} attach="attributes-position" />
        <primitive object={geometryAttr.data} attach="attributes-aData" />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={sparkVert}
        fragmentShader={sparkFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

export default function Landmarks({ fx }: { fx: boolean }) {
  return (
    <>
      {projects.map((p, i) => (
        <Landmark key={p.id} index={i} fx={fx} />
      ))}
      {fx && <Sparks perDistrict={36} />}
    </>
  );
}

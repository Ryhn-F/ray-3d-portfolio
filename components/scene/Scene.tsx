"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { intro } from "@/lib/intro";
import { sceneStats, scrollState } from "@/lib/scroll-state";
import type { Tier } from "@/lib/capability";
import Atmosphere from "./Atmosphere";
import CameraRig from "./CameraRig";
import City from "./City";
import Landmarks from "./Landmarks";
import ScrollDriver from "./ScrollDriver";

/**
 * The scene animates continuously (shader time, landmarks, drift), so it asks
 * for a frame every tick while the tab is visible. Lite tier is capped at ~30fps.
 */
function Heartbeat({ tier }: { tier: Tier }) {
  const frames = useRef(0);
  useFrame(({ invalidate }) => {
    frames.current++;
    if (frames.current === 3) intro.mark("scene"); // first frames drawn (shaders compiled)
    if (document.visibilityState !== "visible") return;
    // Every callback is followed by a render, so cap lite by delaying the next request.
    if (tier === "lite") window.setTimeout(invalidate, 33);
    else invalidate();
  });
  return null;
}

/** Reads renderer.info from the previous frame; never takes over rendering. */
function StatsBridge({ tier }: { tier: Tier }) {
  const avgRef = useRef(0);
  useFrame(({ gl, viewport }, dt) => {
    sceneStats.active = true;
    sceneStats.tier = tier;
    sceneStats.calls = gl.info.render.calls;
    sceneStats.triangles = gl.info.render.triangles;
    sceneStats.geometries = gl.info.memory.geometries;
    sceneStats.textures = gl.info.memory.textures;
    sceneStats.dpr = viewport.dpr;
    if (dt > 0 && dt < 0.2) {
      avgRef.current = avgRef.current ? avgRef.current * 0.9 + dt * 0.1 : dt;
      sceneStats.fps = Math.round(1 / avgRef.current);
    }
  });
  return null;
}

export default function Scene({
  tier,
  onFail,
}: {
  tier: Exclude<Tier, "static">;
  onFail: () => void;
}) {
  const full = tier === "full";
  const [dpr, setDpr] = useState<[number, number]>(full ? [1, 2] : [1, 1.25]);
  const [fx, setFx] = useState(true);

  return (
    <>
      <Canvas
        frameloop="demand"
        dpr={dpr}
        gl={{ antialias: full, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 38, near: 0.5, far: 320, position: [0, 80, 120] }}
        onCreated={({ gl, invalidate }) => {
          scrollState.invalidate = invalidate;
          gl.setClearColor(0x04050a, 1);
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            onFail();
          });
          invalidate();
        }}
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr([1, 1]);
            setFx(false);
          }}
        />
        <Atmosphere fx={fx} />
        <City keep={full ? 1 : 0.55} maxBuildings={full ? 2400 : 1100} fx={fx} />
        <Landmarks fx={fx} />
        <CameraRig tilt={full} kick />
        <Heartbeat tier={tier} />
        <StatsBridge tier={tier} />
      </Canvas>
      <ScrollDriver />
    </>
  );
}

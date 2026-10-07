"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { scrollState } from "@/lib/scroll-state";
import { sampleCamera } from "./camera-path";

const pos = new Vector3();
const look = new Vector3();
const rel = new Vector3();

const BASE_FOV = 38;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function CameraRig({ tilt, kick }: { tilt: boolean; kick: boolean }) {
  const current = useRef(0);
  const vel = useRef(0);
  const fov = useRef(BASE_FOV);
  const orbit = useRef(0);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });

  useEffect(() => {
    if (!tilt) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [tilt]);

  useFrame(({ camera, size, clock }, dt) => {
    const cam = camera as PerspectiveCamera;
    const t = clock.elapsedTime;
    const target = scrollState.stop;

    const prev = current.current;
    current.current = MathUtils.damp(prev, target, 5, dt);
    const v = dt > 0 ? (current.current - prev) / dt : 0;
    vel.current = MathUtils.damp(vel.current, v, 8, dt);

    sampleCamera(current.current, pos, look);

    // Intro: spiral in from a far, high orbit (splash) down to the hero pose.
    const intro = easeInOutCubic(MathUtils.clamp(scrollState.intro, 0, 1));
    if (scrollState.intro < 1) {
      orbit.current += dt * 0.12 * (1 - intro);
      const spin = (1 - intro) * 1.9 + orbit.current;
      rel.copy(pos).sub(look);
      rel.multiplyScalar(1 + (1 - intro) * 1.15);
      rel.y += (1 - intro) * 26;
      rel.applyAxisAngle(Y_AXIS, spin);
      pos.copy(look).add(rel);
    }

    // Idle drift + pointer parallax (damped).
    pos.x += Math.sin(t * 0.23) * 0.7;
    pos.y += Math.sin(t * 0.31) * 0.45;
    if (tilt) {
      const p = pointer.current;
      p.sx = MathUtils.damp(p.sx, p.x, 3, dt);
      p.sy = MathUtils.damp(p.sy, p.y, 3, dt);
      pos.x += p.sx * 1.4;
      pos.y += -p.sy * 0.9;
    }

    cam.position.copy(pos);
    cam.lookAt(look);

    // Scroll velocity: slight FOV kick and roll for a "speed" feel.
    if (kick) {
      const speed = Math.min(1, Math.abs(vel.current) * 0.9);
      fov.current = MathUtils.damp(fov.current, BASE_FOV + speed * 9, 6, dt);
      cam.rotateZ(MathUtils.clamp(-vel.current * 0.012, -0.05, 0.05));
    } else {
      fov.current = BASE_FOV;
    }
    if (Math.abs(cam.fov - fov.current) > 0.001) cam.fov = fov.current;

    // Shift the projection so the city sits beside the text column.
    const desktop = size.width >= 768;
    cam.setViewOffset(
      size.width,
      size.height,
      desktop ? -size.width * 0.17 : 0,
      desktop ? 0 : size.height * 0.2,
      size.width,
      size.height,
    );
    cam.updateProjectionMatrix();
  });

  return null;
}

const Y_AXIS = new Vector3(0, 1, 0);

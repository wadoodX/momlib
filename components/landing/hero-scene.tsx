"use client";

/* react-three-fiber's animation loop is intentionally imperative: it mutates
   preallocated typed-array buffers and three.js objects every frame for
   performance. The React Compiler purity/immutability rules can't model that, so
   they're disabled for this file. */
/* eslint-disable react-hooks/purity, react-hooks/immutability */

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const SAGE = new THREE.Color("#7c9468");
const GOLD = new THREE.Color("#bf9f53");
const PAPER = new THREE.Color("#f0ebde");

const N = 180;
const BOUNDS = new THREE.Vector3(7.5, 4.6, 3);
const CURSOR_RADIUS = 3.1;

type Pointer = React.RefObject<{ x: number; y: number }>;

// soft round glow sprite so points read as glowing dots, not flat squares
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const DUST_COUNT = 650;

// ambient particle haze drifting behind the network for depth + atmosphere
function Dust({ animate, pointer }: { animate: boolean; pointer: Pointer }) {
  const group = useRef<THREE.Group>(null);
  const glow = useMemo(() => makeGlowTexture(), []);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3);
    const colors = new Float32Array(DUST_COUNT * 3);
    const c = new THREE.Color();
    for (let i = 0; i < DUST_COUNT; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = -2 - Math.random() * 8; // deeper than the network
      const r = Math.random();
      c.copy(r < 0.18 ? GOLD : r < 0.5 ? SAGE : PAPER);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g || !animate) return;
    const delta = Math.min(rawDelta, 0.05);
    g.rotation.y += delta * 0.02;
    g.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.4;
    // stronger parallax than the network so the haze feels nearer/looser
    g.position.x += (pointer.current.x * 1.1 - g.position.x) * 0.03;
  });

  return (
    <group ref={group}>
      <Points positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          vertexColors
          transparent
          map={glow}
          alphaMap={glow}
          size={0.13}
          sizeAttenuation
          depthWrite={false}
          opacity={0.55}
        />
      </Points>
    </group>
  );
}

function Particles({ animate, pointer }: { animate: boolean; pointer: Pointer }) {
  const group = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // particle state + reusable buffers, allocated once
  const data = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const velocities = new Float32Array(N * 3);
    const pointColors = new Float32Array(N * 3);
    const c = new THREE.Color();
    for (let i = 0; i < N; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * BOUNDS.x * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * BOUNDS.y * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * BOUNDS.z * 2;
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
      c.copy(Math.random() < 0.28 ? GOLD : SAGE);
      pointColors[i * 3] = c.r;
      pointColors[i * 3 + 1] = c.g;
      pointColors[i * 3 + 2] = c.b;
    }
    return { positions, velocities, pointColors };
  }, []);

  const cursor = useMemo(() => new THREE.Vector3(999, 999, 0), []);

  // soft round glow sprite so particles read as glowing points, not flat squares
  const glow = useMemo(() => makeGlowTexture(), []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const g = group.current;

    if (!animate) return;

    // cursor in world space on the z=0 plane
    cursor.set(
      (pointer.current.x * viewport.width) / 2,
      (pointer.current.y * viewport.height) / 2,
      0,
    );

    const { positions, velocities } = data;
    for (let i = 0; i < N; i += 1) {
      // integrate
      positions[i * 3] += velocities[i * 3] * delta;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // bounce within bounds
      for (let a = 0; a < 3; a += 1) {
        const lim = a === 0 ? BOUNDS.x : a === 1 ? BOUNDS.y : BOUNDS.z;
        const p = positions[i * 3 + a];
        if (p > lim || p < -lim) velocities[i * 3 + a] *= -1;
      }

      // cursor repel + gentle swirl: particles push away from the cursor and
      // curl around it (tangential force in the xy-plane) so the field reacts
      // alive without losing its calm drift
      const dx = positions[i * 3] - cursor.x;
      const dy = positions[i * 3 + 1] - cursor.y;
      const dz = positions[i * 3 + 2] - cursor.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < CURSOR_RADIUS * CURSOR_RADIUS && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const falloff = (CURSOR_RADIUS - d) / CURSOR_RADIUS;
        const f = falloff * delta * 6;
        const nx = dx / d, ny = dy / d;
        velocities[i * 3] += nx * f;
        velocities[i * 3 + 1] += ny * f;
        velocities[i * 3 + 2] += (dz / d) * f;
        // tangential (perpendicular to the radial direction) for a soft swirl
        const s = falloff * delta * 3;
        velocities[i * 3] += -ny * s;
        velocities[i * 3 + 1] += nx * s;
      }

      // gentle damping toward a calm drift speed
      velocities[i * 3] *= 0.99;
      velocities[i * 3 + 1] *= 0.99;
      velocities[i * 3 + 2] *= 0.99;
    }

    // point geometry follows the same position buffer
    const pts = group.current?.getObjectByName("nodes") as THREE.Points | undefined;
    if (pts) (pts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    if (g) {
      g.rotation.y += delta * 0.05;
      g.rotation.x += (pointer.current.y * 0.12 - g.rotation.x) * 0.04;
    }
  });

  return (
    <group ref={group}>
      <Points
        name="nodes"
        positions={data.positions}
        colors={data.pointColors}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          vertexColors
          transparent
          map={glow}
          alphaMap={glow}
          size={0.34}
          sizeAttenuation
          depthWrite={false}
          opacity={1}
        />
      </Points>
    </group>
  );
}

export default function HeroScene({ animate = true }: { animate?: boolean }) {
  const pointer = useRef({ x: 0, y: 0 });

  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 55 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onPointerMove={(event) => {
        pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <Dust animate={animate} pointer={pointer} />
        <Particles animate={animate} pointer={pointer} />
      </Suspense>
    </Canvas>
  );
}

"use client";

import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Clone, Sparkles, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

type Theme = "light" | "dark";
type Pointer = React.RefObject<{ x: number; y: number }>;

const MODEL_URL = "/models/lantern-opt.glb";

// Warm accents per theme (motes + flame-light color).
const PALETTE: Record<Theme, { flame: string; spark: string }> = {
  light: { flame: "#ffd591", spark: "#bf9f53" },
  dark: { flame: "#ffe0a3", spark: "#cdb069" },
};

// Curated layout — start clustered toward the sides + depth (central band clear
// behind the headline). `drift` is how far each lantern travels over a full-page
// scroll (0→1), so the field rearranges purposefully as you move down.
const LAYOUT: { pos: [number, number, number]; scale: number; seed: number; drift: [number, number] }[] = [
  { pos: [-4.3, -0.6, 0.4], scale: 1.0, seed: 0.5, drift: [2.2, 3.0] },
  { pos: [4.5, 0.7, -0.2], scale: 1.1, seed: 1.7, drift: [-2.6, 2.4] },
  { pos: [-3.5, 1.8, -1.8], scale: 0.72, seed: 2.9, drift: [1.0, -3.4] },
  { pos: [3.3, -1.7, -1.2], scale: 0.8, seed: 4.1, drift: [-1.2, 4.2] },
  { pos: [-1.8, 2.4, -5.5], scale: 0.5, seed: 5.6, drift: [3.0, 1.0] },
  { pos: [2.2, 2.1, -6.5], scale: 0.46, seed: 0.9, drift: [-3.2, 1.6] },
  { pos: [0.3, -2.6, -7.5], scale: 0.5, seed: 3.3, drift: [0.4, 5.0] },
];

function FloatingLantern({
  pos,
  scale,
  seed,
  drift,
  scroll,
  scene,
  unit,
  offset,
}: {
  pos: [number, number, number];
  scale: number;
  seed: number;
  drift: [number, number];
  scroll: React.RefObject<number>;
  scene: THREE.Object3D;
  unit: number;
  offset: THREE.Vector3;
}) {
  const ref = useRef<THREE.Group>(null);
  const base = useMemo(() => new THREE.Vector3(...pos), [pos]);
  const applied = useRef(0);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // ease the applied scroll toward the real scroll for a fluid follow
    applied.current += (scroll.current - applied.current) * 0.07;
    const s = applied.current;
    g.position.x = base.x + drift[0] * s + Math.sin(t * 0.28 + seed) * 0.16;
    g.position.y = base.y + drift[1] * s + Math.sin(t * 0.46 + seed * 1.7) * 0.2;
    // turn a little faster as the page scrolls, so they feel alive with motion
    g.rotation.y += 0.0016 + s * 0.004;
  });

  return (
    <group ref={ref} position={pos} scale={scale}>
      {/* the model, centered at the origin and normalized to a common size */}
      <group scale={unit} position={[-offset.x * unit, -offset.y * unit, -offset.z * unit]}>
        <Clone object={scene} />
      </group>
    </group>
  );
}

function Lanterns({ scroll }: { scroll: React.RefObject<number> }) {
  const { scene } = useGLTF(MODEL_URL);

  // Center the model at the origin and scale it to a common height.
  const { unit, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return { unit: 2.1 / (size.y || 1), offset: center };
  }, [scene]);

  return (
    <>
      {LAYOUT.map((l, i) => (
        <FloatingLantern
          key={i}
          pos={l.pos}
          scale={l.scale}
          seed={l.seed}
          drift={l.drift}
          scroll={scroll}
          scene={scene}
          unit={unit}
          offset={offset}
        />
      ))}
    </>
  );
}

function Scene({
  theme,
  pointer,
  scroll,
  sparkleCount,
}: {
  theme: Theme;
  pointer: Pointer;
  scroll: React.RefObject<number>;
  sparkleCount: number;
}) {
  const group = useRef<THREE.Group>(null);
  const p = PALETTE[theme];

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += (pointer.current.x * 0.1 - g.rotation.y) * 0.03;
    g.rotation.x += (pointer.current.y * -0.07 - g.rotation.x) * 0.03;
  });

  return (
    <>
      <ambientLight intensity={theme === "dark" ? 0.55 : 0.85} />
      <directionalLight position={[4, 6, 5]} intensity={1.15} />
      <directionalLight position={[-5, 2, -3]} intensity={0.4} />
      <pointLight position={[-4, 2, 4]} color={p.flame} intensity={1.6} distance={18} decay={1.5} />
      <pointLight position={[4, -1, 4]} color={p.flame} intensity={1.1} distance={16} decay={1.6} />
      <group ref={group}>
        <Lanterns scroll={scroll} />
      </group>
      <Sparkles count={sparkleCount} scale={[13, 8, 6]} size={2.4} speed={0.28} opacity={0.6} color={p.spark} noise={1.2} />
    </>
  );
}

/** Static CSS+SVG lantern cluster for reduced-motion, low-power, or WebGL failure. */
function LanternFallback() {
  const lamp = (cx: number, cy: number, s: number, key: string) => (
    <g key={key} transform={`translate(${cx} ${cy}) scale(${s})`}>
      <circle cx="0" cy="-46" r="5" />
      <path d="M-22 -22 L0 -42 L22 -22 Z" />
      <rect x="-18" y="-22" width="36" height="44" rx="4" fill="rgba(207,176,105,0.16)" />
      <path d="M-18 22 L0 38 L18 22 Z" />
      <circle cx="0" cy="2" r="6" fill="rgba(255,213,145,0.9)" stroke="none" />
    </g>
  );
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-[18%] top-1/2 h-[34vh] w-[34vh] -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(207,176,105,0.35), transparent 70%)" }}
      />
      <div
        className="absolute right-[16%] top-[38%] h-[28vh] w-[28vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(207,176,105,0.3), transparent 70%)" }}
      />
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full text-gold opacity-70"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        {lamp(180, 360, 1.5, "a")}
        {lamp(830, 250, 1.7, "b")}
        {lamp(300, 150, 0.9, "c")}
        {lamp(700, 470, 1.1, "d")}
      </svg>
    </div>
  );
}

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export default function HeroLantern({ animate = true }: { animate?: boolean }) {
  const { resolvedTheme } = useTheme();
  const theme: Theme = resolvedTheme === "dark" ? "dark" : "light";
  const [failed, setFailed] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  // The canvas sits behind page content (pointer-events:none), so track the
  // cursor + scroll position at the window level (drives parallax + the
  // scroll-linked lantern motion).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const lowPower = useMemo(() => {
    if (typeof window === "undefined") return false;
    const small = window.matchMedia("(max-width: 640px)").matches;
    const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
    return small && fewCores;
  }, []);

  if (failed || lowPower || !animate) {
    return <LanternFallback />;
  }

  const sparkleCount = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches ? 24 : 60;

  return (
    <WebGLErrorBoundary fallback={<LanternFallback />}>
      <Canvas
        camera={{ position: [0, 0.2, 7], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            "webglcontextlost",
            (e) => {
              e.preventDefault();
              setFailed(true);
            },
            { once: true },
          );
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Suspense fallback={null}>
          <Scene theme={theme} pointer={pointer} scroll={scroll} sparkleCount={sparkleCount} />
        </Suspense>
      </Canvas>
    </WebGLErrorBoundary>
  );
}

useGLTF.preload(MODEL_URL);

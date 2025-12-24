"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshDistortMaterial,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";

interface RankBadge3DProps {
  rankName: string;
  rankEmoji?: string;
  primaryColor?: string;
  secondaryColor?: string;
  size?: number;
}

// Badge mesh component
function BadgeMesh({
  primaryColor = "#8b5cf6",
  secondaryColor = "#6366f1",
}: {
  primaryColor: string;
  secondaryColor: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {/* Main badge body */}
        <dodecahedronGeometry args={[1, 0]} />
        <MeshDistortMaterial
          color={primaryColor}
          envMapIntensity={0.4}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          metalness={0.9}
          roughness={0.1}
          distort={0.2}
          speed={2}
        />
      </mesh>

      {/* Inner glow */}
      <mesh scale={0.7}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[1.3, 0.08, 16, 100]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffa500"
          emissiveIntensity={0.3}
          metalness={1}
          roughness={0.1}
        />
      </mesh>

      {/* Sparkle particles */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 1.5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius * 0.5,
              Math.sin(angle) * radius * 0.3,
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={1}
            />
          </mesh>
        );
      })}
    </Float>
  );
}

// Rank-specific badge configurations
const RANK_CONFIGS: Record<
  string,
  { primary: string; secondary: string; glow: string }
> = {
  Bronze: { primary: "#cd7f32", secondary: "#b87333", glow: "#8b4513" },
  Silver: { primary: "#c0c0c0", secondary: "#a8a8a8", glow: "#808080" },
  Gold: { primary: "#ffd700", secondary: "#ffb700", glow: "#ff8c00" },
  Platinum: { primary: "#e5e4e2", secondary: "#b0c4de", glow: "#add8e6" },
  Diamond: { primary: "#b9f2ff", secondary: "#7fffd4", glow: "#00ced1" },
  Master: { primary: "#9400d3", secondary: "#8b008b", glow: "#9932cc" },
  Grandmaster: { primary: "#ff0000", secondary: "#dc143c", glow: "#ff4500" },
  Champion: { primary: "#000000", secondary: "#1a1a1a", glow: "#4b0082" },
  Legend: { primary: "#ffd700", secondary: "#ff4500", glow: "#ff6347" },
  default: { primary: "#8b5cf6", secondary: "#6366f1", glow: "#a78bfa" },
};

function getRankConfig(rankName: string): {
  primary: string;
  secondary: string;
  glow: string;
} {
  // Try to find exact match or partial match
  const normalizedRank = rankName.toLowerCase();
  for (const [key, config] of Object.entries(RANK_CONFIGS)) {
    if (normalizedRank.includes(key.toLowerCase())) {
      return config;
    }
  }
  return RANK_CONFIGS.default!;
}

export function RankBadge3D({
  rankName,
  rankEmoji = "🏅",
  primaryColor,
  secondaryColor,
  size = 200,
}: RankBadge3DProps) {
  const config = getRankConfig(rankName);
  const primary = primaryColor || config.primary;
  const secondary = secondaryColor || config.secondary;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <pointLight
            position={[0, 5, 0]}
            intensity={0.8}
            color={config.glow}
          />

          {/* Badge */}
          <BadgeMesh primaryColor={primary} secondaryColor={secondary} />

          {/* Environment for reflections */}
          <Environment preset="city" />

          {/* Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
            autoRotate
            autoRotateSpeed={1}
          />
        </Suspense>
      </Canvas>

      {/* Emoji overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-4xl drop-shadow-lg"
          style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))" }}
        >
          {rankEmoji}
        </span>
      </div>

      {/* Rank name */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <span className="text-xs font-bold text-white drop-shadow-lg bg-black/30 px-2 py-1 rounded-full">
          {rankName}
        </span>
      </div>
    </div>
  );
}

export default RankBadge3D;

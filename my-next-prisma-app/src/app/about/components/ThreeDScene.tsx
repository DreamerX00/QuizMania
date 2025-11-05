"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Float,
  Stars,
  Html,
} from "@react-three/drei";
import { LuAtom } from "react-icons/lu";
import { FaRocket, FaLaptopCode, FaPalette } from "react-icons/fa";
import { GiCrystalBall } from "react-icons/gi";
import * as THREE from "three";

// 3D Globe Component
function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.5}>
        <MeshDistortMaterial
          color="#4f46e5"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0}
        />
      </Sphere>
    </Float>
  );
}

// Floating Icons Component
function FloatingIcons() {
  const icons = [
    { icon: <LuAtom size={48} color="#38bdf8" />, position: [3, 2, 0] },
    { icon: <FaRocket size={48} color="#a78bfa" />, position: [-3, 1, 2] },
    { icon: <FaLaptopCode size={48} color="#fbbf24" />, position: [2, -2, 1] },
    { icon: <FaPalette size={48} color="#f472b6" />, position: [-2, 3, -1] },
    { icon: <GiCrystalBall size={48} color="#34d399" />, position: [1, -3, 2] },
  ];

  return (
    <>
      {icons.map((item, index) => (
        <Float key={index} speed={2} rotationIntensity={1} floatIntensity={2}>
          <group position={item.position as [number, number, number]}>
            <Html center style={{ pointerEvents: "none" }}>
              {item.icon}
            </Html>
          </group>
        </Float>
      ))}
    </>
  );
}

// Main 3D Scene Component
export default function ThreeDScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Globe />
      <FloatingIcons />
      <Stars radius={300} depth={60} count={1000} factor={7} saturation={0} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

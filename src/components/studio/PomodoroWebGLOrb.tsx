import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { pomodoroVertexShader, pomodoroFragmentShader } from '../../shaders/pomodoroLiquidGlassShader';

interface PomodoroWebGLOrbProps {
  timeLeft: number;
  totalDuration: number;
  isRunning: boolean;
  fluidColorHex: string;
  accentColorHex: string;
  size?: number;
  onOrbClick?: () => void;
}

export const PomodoroWebGLOrb: React.FC<PomodoroWebGLOrbProps> = ({
  timeLeft,
  totalDuration,
  isRunning,
  fluidColorHex,
  accentColorHex,
  size = 340,
  onOrbClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    material: THREE.ShaderMaterial;
    clock: THREE.Clock;
    rafId: number;
  } | null>(null);

  // Keep live refs for animation loop
  const paramsRef = useRef({
    timeLeft,
    totalDuration,
    isRunning,
    fluidColor: new THREE.Color(fluidColorHex),
    accentColor: new THREE.Color(accentColorHex),
  });

  useEffect(() => {
    paramsRef.current.timeLeft = timeLeft;
    paramsRef.current.totalDuration = totalDuration;
    paramsRef.current.isRunning = isRunning;
    paramsRef.current.fluidColor.set(fluidColorHex);
    paramsRef.current.accentColor.set(accentColorHex);
  }, [timeLeft, totalDuration, isRunning, fluidColorHex, accentColorHex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.warn('Pomodoro WebGL initialization failed:', err);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uResolution: { value: new THREE.Vector2(size * Math.min(window.devicePixelRatio, 2), size * Math.min(window.devicePixelRatio, 2)) },
      uTime: { value: 0 },
      uTimeLeft: { value: timeLeft },
      uTotalDuration: { value: totalDuration },
      uIsRunning: { value: isRunning ? 1.0 : 0.0 },
      uFluidColor: { value: new THREE.Color(fluidColorHex) },
      uAccentColor: { value: new THREE.Color(accentColorHex) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uOrbRadius: { value: 0.66 },
      uRingInnerRadius: { value: 0.77 },
      uRingOuterRadius: { value: 0.94 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: pomodoroVertexShader,
      fragmentShader: pomodoroFragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();

    const animate = () => {
      const p = paramsRef.current;
      material.uniforms.uTime.value = clock.getElapsedTime();
      material.uniforms.uTimeLeft.value = p.timeLeft;
      material.uniforms.uTotalDuration.value = p.totalDuration;
      material.uniforms.uIsRunning.value = p.isRunning ? 1.0 : 0.0;
      material.uniforms.uFluidColor.value.copy(p.fluidColor);
      material.uniforms.uAccentColor.value.copy(p.accentColor);

      renderer.render(scene, camera);
      threeRef.current!.rafId = requestAnimationFrame(animate);
    };

    threeRef.current = {
      renderer,
      scene,
      camera,
      material,
      clock,
      rafId: requestAnimationFrame(animate),
    };

    return () => {
      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.rafId);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        threeRef.current = null;
      }
    };
  }, [size]);

  // Handle pointer interaction for interactive fluid ripple
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!threeRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    threeRef.current.material.uniforms.uMouse.value.set(x, y);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onClick={onOrbClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      style={{ width: size, height: size }}
      title="Click round liquid glass to toggle Play / Pause"
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="rounded-full pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createBurgerGroup } from './proceduralModels';

interface FoodLoader3DProps {
  message?: string;
}

export const FoodLoader3D: React.FC<FoodLoader3DProps> = ({ message = 'Preparing your culinary universe...' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 1.2, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xef4444, 1.0);
    fillLight.position.set(-3, -1, -2);
    scene.add(fillLight);

    // Burger Model
    const burger = createBurgerGroup();
    burger.scale.set(0.7, 0.7, 0.7);
    scene.add(burger);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      burger.rotation.y += 0.035;
      burger.rotation.x = Math.sin(t * 3) * 0.15;
      burger.position.y = Math.sin(t * 4) * 0.12;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div ref={containerRef} className="w-36 h-36 mx-auto mb-2" />
      <div className="flex items-center gap-2 justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="text-sm font-semibold text-stone-600 dark:text-stone-300 mt-3">{message}</p>
    </div>
  );
};

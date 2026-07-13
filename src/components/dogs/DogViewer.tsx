"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildDogMesh, LOOK_PROFILES, emojiForDog } from "@/lib/dog-mesh";

interface DogViewerProps {
  breed: string | null;
  size: string;
  className?: string;
  style?: React.CSSProperties;
}

export function DogViewer({ breed, size, className, style }: DogViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const emoji = emojiForDog(breed, size);
    const profile = LOOK_PROFILES[emoji] ?? LOOK_PROFILES["🐕"];

    // Scene
    const scene = new THREE.Scene();
    scene.background = null; // transparent — inherits container bg

    // Camera: slightly angled orthographic, same feel as the park
    const aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
    const viewH = 2.2;
    const camera = new THREE.OrthographicCamera(
      -viewH * aspect, viewH * aspect, viewH, -viewH, 0.1, 30
    );
    camera.position.set(0, 2.2, 3.8);
    camera.lookAt(0, 0.6, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(1); // chunky pixel-art upscale
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    mount.appendChild(renderer.domElement);

    // Lighting (matches the park)
    scene.add(new THREE.HemisphereLight(0xcdeffd, 0x6cb843, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(4, 8, 4);
    sun.castShadow = true;
    scene.add(sun);

    // Ground patch
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(3, 24),
      new THREE.MeshLambertMaterial({ color: 0x7ec850 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Dog
    const { root, head, tailPivot, legPivots } = buildDogMesh(profile);
    root.scale.setScalar(profile.sizeMul * 0.9);
    // Face camera (local forward is -Z)
    root.rotation.y = Math.PI;
    scene.add(root);

    // Resize to fill container
    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h, true);
      const a = w / Math.max(h, 1);
      camera.left = -viewH * a;
      camera.right = viewH * a;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    // Animation loop — idle: tail wag + gentle body bob, no walking
    let raf = 0;
    const legPhase = Math.random() * Math.PI * 2;
    const WALK_FREQ = 7;
    const MAX_LEG_SWING = 0.45;

    function animate() {
      raf = requestAnimationFrame(animate);
      const t = performance.now() / 1000;

      // Gentle idle sway on the body
      root.rotation.y = Math.PI + Math.sin(t * 0.9) * 0.12;
      root.position.y = Math.sin(t * 1.8) * 0.025;

      // Slow trot legs so it doesn't look fully static
      const walkT = t * WALK_FREQ * 0.35 + legPhase;
      const swing = MAX_LEG_SWING * 0.4;
      if (legPivots.length === 4) {
        legPivots[0].rotation.x = Math.sin(walkT) * swing;
        legPivots[3].rotation.x = Math.sin(walkT) * swing;
        legPivots[1].rotation.x = Math.sin(walkT + Math.PI) * swing;
        legPivots[2].rotation.x = Math.sin(walkT + Math.PI) * swing;
      }

      // Tail wag
      if (tailPivot) tailPivot.rotation.y = Math.sin(t * 4 + legPhase) * 0.55;

      // Head gentle nod
      if (head) head.rotation.x = Math.sin(t * 1.1) * 0.06;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  // Re-run when the dog type changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breed, size]);

  return <div ref={mountRef} className={className} style={{ imageRendering: "pixelated", ...style }} />;
}

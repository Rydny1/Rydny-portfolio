import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { withBase } from '../../lib/base';

const STONE = '#0f0e0d';
const BRONZE = '#b8935b';

const SIDE = 1.4;
const IN_RADIUS = SIDE / (2 * Math.sqrt(3));
const CIRCUM_RADIUS = SIDE / Math.sqrt(3);
const HEIGHT = SIDE * 1.6;
const FACE_ANGLES = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
const EDGE_ANGLES = [Math.PI / 3, Math.PI, (5 * Math.PI) / 3];
const BASE_TILT = 0.4;

function coverFit(tex: THREE.Texture, planeAspect: number) {
  const img = tex.image as { width: number; height: number } | undefined;
  if (!img?.width) return;
  const imgAspect = img.width / img.height;
  if (imgAspect > planeAspect) {
    tex.repeat.set(planeAspect / imgAspect, 1);
    tex.offset.set((1 - planeAspect / imgAspect) / 2, 0);
  } else {
    tex.repeat.set(1, imgAspect / planeAspect);
    tex.offset.set(0, (1 - imgAspect / planeAspect) / 2);
  }
  tex.needsUpdate = true;
}

function makeTextCanvasTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = STONE;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  draw(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Face({ angle, texture }: { angle: number; texture: THREE.Texture }) {
  const pos: [number, number, number] = [Math.sin(angle) * IN_RADIUS, 0, Math.cos(angle) * IN_RADIUS];
  const geo = useMemo(() => new THREE.PlaneGeometry(SIDE * 0.98, HEIGHT * 0.98), []);

  useEffect(() => {
    coverFit(texture, SIDE / HEIGHT);
  }, [texture]);

  return (
    <group position={pos} rotation={[0, angle, 0]}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          map={texture}
          emissiveMap={texture}
          emissive={new THREE.Color('#ffffff')}
          emissiveIntensity={0.22}
          roughness={0.4}
          metalness={0.05}
          clearcoat={0.5}
          clearcoatRoughness={0.3}
        />
      </mesh>
    </group>
  );
}

function EdgeRod({ angle }: { angle: number }) {
  const pos: [number, number, number] = [Math.sin(angle) * IN_RADIUS, 0, Math.cos(angle) * IN_RADIUS];
  const geo = useMemo(() => new THREE.CylinderGeometry(SIDE * 0.045, SIDE * 0.045, HEIGHT, 12), []);
  return (
    <mesh position={pos} geometry={geo}>
      <meshPhysicalMaterial color={STONE} metalness={0.3} roughness={0.5} clearcoat={0.6} clearcoatRoughness={0.2} />
    </mesh>
  );
}

function Cap({ y, flip, texture }: { y: number; flip: boolean; texture: THREE.Texture }) {
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(CIRCUM_RADIUS * 0.97, 3);
    g.rotateZ(Math.PI / 6);
    return g;
  }, []);
  return (
    <group position={[0, y, 0]} rotation={[flip ? Math.PI / 2 : -Math.PI / 2, 0, 0]}>
      <mesh geometry={geo}>
        <meshPhysicalMaterial
          map={texture}
          roughness={0.35}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}

export default function PrismMesh({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const [hovering, setHovering] = useState(false);
  const speedRef = useRef(0);
  const settleRef = useRef(0);
  const startTime = useRef<number | null>(null);

  const [altays, apex, eclat] = useTexture([
    withBase('/assets/ALTAYS_heroimg.webp'),
    withBase('/assets/APEX_hompage.webp'),
    withBase('/assets/Eclat_heroimg.webp'),
  ]);
  [altays, apex, eclat].forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  const arabicTexture = useMemo(
    () =>
      makeTextCanvasTexture((ctx, w, h) => {
        ctx.direction = 'rtl';
        ctx.fillStyle = '#f5f1e8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '150px "Noto Naskh Arabic", serif';
        ctx.fillText('إتقان', w / 2, h / 2 + 20);
      }),
    []
  );

  const monogramTexture = useMemo(
    () =>
      makeTextCanvasTexture((ctx, w, h) => {
        ctx.fillStyle = '#f5f1e8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '150px "Fraunces Variable", Georgia, serif';
        ctx.fillText('RI', w / 2, h / 2 + 10);
      }),
    []
  );

  useEffect(() => {
    document.fonts?.ready.then(() => {
      arabicTexture.needsUpdate = true;
      monogramTexture.needsUpdate = true;
    });
  }, [arabicTexture, monogramTexture]);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - startTime.current;

    settleRef.current = Math.min(1, t / 1.1);
    const ease = 1 - Math.pow(1 - settleRef.current, 3);
    const BASE_SCALE = 0.62;
    group.current.scale.setScalar(reduceMotion ? BASE_SCALE : BASE_SCALE * (0.9 + 0.1 * ease));
    group.current.rotation.x = BASE_TILT;

    if (reduceMotion) {
      group.current.rotation.y = 0.3;
      return;
    }

    const targetSpeed = hovering ? 0 : (Math.PI * 2) / 18;
    speedRef.current += (targetSpeed - speedRef.current) * (1 - Math.pow(0.001, delta));
    group.current.rotation.y += speedRef.current * delta;
  });

  return (
    <group
      ref={group}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 3]} intensity={0.8} />
      <Environment resolution={128}>
        <Lightformer intensity={2} color="white" position={[0, 3, -3]} scale={[6, 3, 1]} />
        <Lightformer intensity={1} color="white" position={[-3, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[3, 2, 1]} />
        <Lightformer intensity={1.2} color={BRONZE} position={[3, 0.5, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 2, 1]} />
      </Environment>

      <Face angle={FACE_ANGLES[0]} texture={altays} />
      <Face angle={FACE_ANGLES[1]} texture={apex} />
      <Face angle={FACE_ANGLES[2]} texture={eclat} />
      <EdgeRod angle={EDGE_ANGLES[0]} />
      <EdgeRod angle={EDGE_ANGLES[1]} />
      <EdgeRod angle={EDGE_ANGLES[2]} />
      <Cap y={HEIGHT / 2} flip={false} texture={arabicTexture} />
      <Cap y={-HEIGHT / 2} flip={true} texture={monogramTexture} />
    </group>
  );
}

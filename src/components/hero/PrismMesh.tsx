import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { withBase } from '../../lib/base';

const STONE = '#0f0e0d';
const BRONZE = '#b8935b';

// Landscape side faces — matches real screenshot aspect (~16:10) so the
// cover-fit crop below stays minimal instead of chopping the image up.
const SIDE = 2.5;
const HEIGHT = 1.55;
const IN_RADIUS = SIDE / (2 * Math.sqrt(3));
const CIRCUM_RADIUS = SIDE / Math.sqrt(3);
const FACE_ANGLES = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
const EDGE_ANGLES = [Math.PI / 3, Math.PI, (5 * Math.PI) / 3];
const BASE_TILT = 0.55;
const BASE_SCALE = 0.72;

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

function useTextTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, font: string) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ready = (document as any).fonts?.load ? (document as any).fonts.load(font) : Promise.resolve();
    Promise.resolve(ready)
      .catch(() => {})
      .then(() => (document as any).fonts?.ready ?? Promise.resolve())
      .then(() => {
        if (cancelled) return;
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = STONE;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        draw(ctx, canvas.width, canvas.height);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return texture;
}

function Face({ angle, texture }: { angle: number; texture: THREE.Texture }) {
  const pos: [number, number, number] = [Math.sin(angle) * IN_RADIUS, 0, Math.cos(angle) * IN_RADIUS];
  const geo = useMemo(() => new THREE.PlaneGeometry(SIDE * 0.985, HEIGHT * 0.985), []);

  useEffect(() => {
    coverFit(texture, SIDE / HEIGHT);
  }, [texture]);

  return (
    <group position={pos} rotation={[0, angle, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.12}
          roughness={0.6}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function EdgeRod({ angle }: { angle: number }) {
  const pos: [number, number, number] = [Math.sin(angle) * IN_RADIUS, 0, Math.cos(angle) * IN_RADIUS];
  const geo = useMemo(() => new THREE.CylinderGeometry(SIDE * 0.03, SIDE * 0.03, HEIGHT, 12), []);
  return (
    <mesh position={pos} geometry={geo}>
      <meshStandardMaterial color={STONE} metalness={0.15} roughness={0.65} />
    </mesh>
  );
}

// Built from the exact same angle system as the side faces (their
// shared edges, EDGE_ANGLES) instead of relying on CircleGeometry's own
// rotation convention lining up by coincidence — that mismatch is the
// most likely cause of the stray wedge shape seen in testing.
function makeCapGeometry() {
  const geo = new THREE.BufferGeometry();
  const verts = EDGE_ANGLES.flatMap((a) => [Math.sin(a) * CIRCUM_RADIUS * 0.98, 0, Math.cos(a) * CIRCUM_RADIUS * 0.98]);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0.5, 1, 0, 0, 1, 0], 2));
  geo.setIndex([0, 1, 2]);
  geo.computeVertexNormals();
  return geo;
}

function Cap({ y, texture }: { y: number; texture: THREE.Texture | null }) {
  const geo = useMemo(() => makeCapGeometry(), []);
  return (
    <group position={[0, y, 0]}>
      <mesh geometry={geo}>
        {texture ? (
          <meshStandardMaterial map={texture} roughness={0.55} metalness={0} color="#ffffff" side={THREE.DoubleSide} />
        ) : (
          <meshStandardMaterial color={STONE} roughness={0.6} metalness={0} side={THREE.DoubleSide} />
        )}
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

  const arabicTexture = useTextTexture((ctx, w, h) => {
    ctx.direction = 'rtl';
    ctx.fillStyle = '#f5f1e8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '150px "Noto Naskh Arabic", serif';
    ctx.fillText('إتقان', w / 2, h / 2 + 20);
  }, '150px "Noto Naskh Arabic"');

  const monogramTexture = useTextTexture((ctx, w, h) => {
    ctx.fillStyle = '#f5f1e8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '150px "Fraunces Variable", Georgia, serif';
    ctx.fillText('RI', w / 2, h / 2 + 10);
  }, '150px "Fraunces Variable"');

  useFrame((state, delta) => {
    if (!group.current) return;
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - startTime.current;

    settleRef.current = Math.min(1, t / 1.1);
    const ease = 1 - Math.pow(1 - settleRef.current, 3);
    group.current.scale.setScalar(reduceMotion ? BASE_SCALE : BASE_SCALE * (0.92 + 0.08 * ease));
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
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 3, 3]} intensity={0.55} />
      <directionalLight position={[-2, 1, -2]} intensity={0.2} color={BRONZE} />
      <Environment resolution={64}>
        <Lightformer intensity={0.6} color="white" position={[0, 3, -3]} scale={[6, 3, 1]} />
        <Lightformer intensity={0.4} color={BRONZE} position={[3, 0.5, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 2, 1]} />
      </Environment>

      <Face angle={FACE_ANGLES[0]} texture={altays} />
      <Face angle={FACE_ANGLES[1]} texture={apex} />
      <Face angle={FACE_ANGLES[2]} texture={eclat} />
      <EdgeRod angle={EDGE_ANGLES[0]} />
      <EdgeRod angle={EDGE_ANGLES[1]} />
      <EdgeRod angle={EDGE_ANGLES[2]} />
      <Cap y={HEIGHT / 2} texture={arabicTexture} />
      <Cap y={-HEIGHT / 2} texture={monogramTexture} />
    </group>
  );
}

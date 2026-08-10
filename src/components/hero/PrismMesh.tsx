import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { withBase } from '../../lib/base';

const STONE = '#24262a';
const SILVER = '#c3c1b8';

// Landscape faces matching the real screenshots (~2.15:1) almost exactly,
// so cover-fit barely has to crop anything.
const SIDE = 2.8;
const HEIGHT = 1.3;
const DEPTH = SIDE * 0.13;
const IN_RADIUS = SIDE / (2 * Math.sqrt(3));
const CIRCUM_RADIUS = SIDE / Math.sqrt(3);
const FACE_ANGLES = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
const BASE_TILT = 0.5;
const BASE_SCALE = 1.0;

const stoneMaterial = new THREE.MeshPhysicalMaterial({
  color: STONE,
  roughness: 0.35,
  metalness: 0.4,
  clearcoat: 0.5,
  clearcoatRoughness: 0.28,
});

// Fully invisible — used on the box slabs' own top/bottom faces so
// there is nothing there to peek out from behind the cap or fight it
// for the same pixels. The cap sits flush at the true height with zero
// gap, and this is the only way to guarantee nothing else is there.
const invisibleMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

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

// A real box with depth, not a paper-thin plane — reads as a solid slab.
// Screenshot on the outward face only; the other five faces are plain
// polished stone.
function Face({ angle, texture }: { angle: number; texture: THREE.Texture }) {
  const pos: [number, number, number] = [Math.sin(angle) * IN_RADIUS, 0, Math.cos(angle) * IN_RADIUS];
  const geo = useMemo(() => new THREE.BoxGeometry(SIDE * 0.99, HEIGHT, DEPTH), []);

  useEffect(() => {
    coverFit(texture, SIDE / HEIGHT);
  }, [texture]);

  const frontMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: texture,
        emissiveMap: texture,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.12,
        roughness: 0.45,
        metalness: 0.05,
        clearcoat: 0.35,
        clearcoatRoughness: 0.3,
      }),
    [texture]
  );

  // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z. Local +Z is the
  // outward-facing side once rotated by `angle` around Y. Top/bottom
  // (+Y/-Y) are invisible — the cap sits flush there instead, and three
  // separate rotated rectangles never form one clean triangular plane
  // on their own, which is what read as a "sub-triangle" before.
  const materials = useMemo(
    () => [stoneMaterial, stoneMaterial, invisibleMaterial, invisibleMaterial, frontMaterial, stoneMaterial],
    [frontMaterial]
  );

  return (
    <group position={pos} rotation={[0, angle, 0]}>
      <mesh geometry={geo} material={materials} />
    </group>
  );
}

function makeCapGeometry() {
  const geo = new THREE.BufferGeometry();
  const edgeAngles = [Math.PI / 3, Math.PI, (5 * Math.PI) / 3];
  // Full circumradius, matching the actual triangular cross-section
  // exactly — a smaller radius here was the visible "child triangle"
  // step/gap between the cap and the slabs.
  const verts = edgeAngles.flatMap((a) => [Math.sin(a) * CIRCUM_RADIUS * 0.99, 0, Math.cos(a) * CIRCUM_RADIUS * 0.99]);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute([0.5, 1, 0, 0, 1, 0], 2));
  geo.setIndex([0, 1, 2]);
  geo.computeVertexNormals();
  return geo;
}

// Both caps are the stone itself — same material as the sides, just
// with an engraved mark. No separate shiny plate, so it reads correctly
// as "dark stone" regardless of which cap happens to face the camera at
// a given moment in the rotation.
// Fully matte on purpose — metalness/clearcoat here kept blowing out to
// a flat white glare under the environment lighting, hiding the engraved
// texture entirely. A plain diffuse material can only get as bright as
// the actual light hitting it, so the dark engraving always stays dark.
function Cap({ y, texture }: { y: number; texture: THREE.Texture | null }) {
  const geo = useMemo(() => makeCapGeometry(), []);
  return (
    <group position={[0, y, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial
          map={texture ?? undefined}
          color={texture ? '#ffffff' : STONE}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
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

  // One strong word, engraved: "itqan" — mastery, doing a craft to
  // perfection. Drawn as a genuine emboss (dark shadow + light highlight
  // offset either side of a recessed base tone) so it reads as carved
  // into the stone rather than printed on it.
  const arabicTexture = useTextTexture((ctx, w, h) => {
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '175px "Noto Naskh Arabic", serif';
    const x = w / 2;
    const y = h / 2 + 24;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillText('إتقان', x + 4, y + 4);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('إتقان', x - 3, y - 3);
    ctx.fillStyle = '#0c0d0e';
    ctx.fillText('إتقان', x, y);
  }, '175px "Noto Naskh Arabic"');

  const monogramTexture = useTextTexture((ctx, w, h) => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '150px "Fraunces Variable", Georgia, serif';
    const x = w / 2;
    const y = h / 2 + 10;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillText('RI', x + 4, y + 4);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('RI', x - 3, y - 3);
    ctx.fillStyle = '#0c0d0e';
    ctx.fillText('RI', x, y);
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
    <group ref={group} onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 3]} intensity={0.6} />
      <directionalLight position={[-2, 1, -2]} intensity={0.25} color={SILVER} />
      <Environment resolution={128}>
        <Lightformer intensity={1.1} color="white" position={[0, 3, -3]} scale={[7, 3, 1]} />
        <Lightformer intensity={0.7} color="white" position={[-3, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[3, 2, 1]} />
        <Lightformer intensity={0.7} color={SILVER} position={[3, 0.5, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 2, 1]} />
      </Environment>

      <Face angle={FACE_ANGLES[0]} texture={altays} />
      <Face angle={FACE_ANGLES[1]} texture={apex} />
      <Face angle={FACE_ANGLES[2]} texture={eclat} />
      <Cap y={HEIGHT / 2} texture={arabicTexture} />
      <Cap y={-HEIGHT / 2} texture={monogramTexture} />
    </group>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { withBase } from '../../lib/base';

const SILVER = '#c3c1b8';
const MARBLE_BASE = '#1b1714';

// ============================================================
// GEOMETRY — a real triangular prism, ONE continuous solid.
//
// Earlier attempts built this from 3 separate box slabs plus 2
// hand-placed triangle caps. Getting all 5 pieces' vertices to land on
// exactly the same edge, every time, at every angle, turned out to be
// impossible to keep aligned — the result always read as separate
// panels glued together, not stone. A THREE.CylinderGeometry with
// radialSegments=3 IS a triangular prism: the sides and both caps are
// vertices of a single BufferGeometry, so there is no seam to
// misalign in the first place.
// ============================================================
const CIRCUM_RADIUS = 1.62;
const HEIGHT = 1.3;
const BASE_TILT = 0.5;
const BASE_SCALE = 1.0;
// CylinderGeometry maps V (0-1) across HEIGHT and U across the
// circumference, so each side face's true on-mesh aspect is
// (triangle side length) / HEIGHT, not square. Drawing the atlas at a
// mismatched aspect was why screenshots looked cropped almost to
// nothing — the canvas region was square, Three.js then stretched
// that square into a ~2.15:1 rectangle, so a cover-fit that looked
// right in the square source cut off most of the width on the mesh.
const FACE_ASPECT = (2 * CIRCUM_RADIUS * Math.sin(Math.PI / 3)) / HEIGHT;
const ATLAS_H = 512;
const ATLAS_SEG = Math.round(ATLAS_H * FACE_ASPECT);
const ATLAS_W = ATLAS_SEG * 3;
const SEAM = ATLAS_SEG * 0.02;

// ============================================================
// MARBLE — procedural, canvas-based. Real dark marble reads as close
// to a uniform near-black base with a handful of sparse, thin,
// wandering veins — not a dense network of hard scratches.
// ============================================================
function smoothPath(ctx: CanvasRenderingContext2D, points: [number, number][]) {
  if (points.length < 2) return;
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i][0] + points[i + 1][0]) / 2;
    const midY = (points[i][1] + points[i + 1][1]) / 2;
    ctx.quadraticCurveTo(points[i][0], points[i][1], midX, midY);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last[0], last[1]);
}

function randomWanderingPath(startX: number, startY: number, endX: number, endY: number, steps: number, jitter: number): [number, number][] {
  const pts: [number, number][] = [[startX, startY]];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const bx = startX + (endX - startX) * t;
    const by = startY + (endY - startY) * t;
    pts.push([bx + (Math.random() - 0.5) * jitter, by + (Math.random() - 0.5) * jitter]);
  }
  pts.push([endX, endY]);
  return pts;
}

function drawVein(ctx: CanvasRenderingContext2D, points: [number, number][], baseWidth: number, color: string, alpha: number) {
  const passes = 3;
  for (let p = 0; p < passes; p++) {
    ctx.beginPath();
    smoothPath(ctx, points);
    ctx.lineWidth = baseWidth * (1 - p / passes) + 0.4;
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha * (1 - p / (passes + 1));
    ctx.shadowColor = color;
    ctx.shadowBlur = 2.5 + p;
    ctx.stroke();
  }
}

function drawMarble(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, veinCount: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#0d0b0a'; // Darker base
  ctx.fillRect(x, y, w, h);

  // Add more subtle clouding for depth
  for (let i = 0; i < 5; i++) {
    const cx = x + Math.random() * w;
    const cy = y + Math.random() * h;
    const r = w * (0.4 + Math.random() * 0.4);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(25,23,21,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  }

  const veinColors = ['rgba(160,150,135,0.7)', 'rgba(100,90,80,0.8)']; // Muted veins
  for (let i = 0; i < veinCount + 4; i++) {
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? x - 20 : x + w + 20;
    const startY = y + Math.random() * h;
    const endX = fromLeft ? x + w + 20 : x - 20;
    const endY = y + Math.random() * h;
    const path = randomWanderingPath(startX, startY, endX, endY, 8, h * 0.2);
    const color = veinColors[i % veinColors.length];
    drawVein(ctx, path, 0.8 + Math.random() * 1.5, color, 0.3 + Math.random() * 0.2);
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  const gloss = ctx.createRadialGradient(x + w * 0.28, y + h * 0.24, 0, x + w * 0.28, y + h * 0.24, w * 0.55);
  gloss.addColorStop(0, 'rgba(120,110,98,0.14)');
  gloss.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gloss;
  ctx.fillRect(x, y, w, h);

  const vignette = ctx.createRadialGradient(x + w / 2, y + h / 2, w * 0.2, x + w / 2, y + h / 2, w * 0.72);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vignette;
  ctx.fillRect(x, y, w, h);

  ctx.restore();
}

function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) {
  const srcAspect = img.width / img.height;
  const dstAspect = dw / dh;
  let sx = 0,
    sy = 0,
    sw = img.width,
    sh = img.height;
  if (srcAspect > dstAspect) {
    sw = img.height * dstAspect;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / dstAspect;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

// A single canvas holding the marble base for the whole lateral
// surface, with the three screenshots inset into it. CylinderGeometry
// maps U 0→1 around the circumference in three equal thirds when
// radialSegments=3, so each 1/3 slice of this canvas lands on exactly
// one face — the marble strip left showing at each edge is the seam,
// and because it's the same mesh as the caps, there is no gap for it
// to misalign against.
function useSideAtlas(images: HTMLImageElement[]) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = ATLAS_W;
    canvas.height = ATLAS_H;
    const ctx = canvas.getContext('2d')!;
    drawMarble(ctx, 0, 0, ATLAS_W, ATLAS_H, 6);
    images.forEach((img, i) => {
      const segX = i * ATLAS_SEG;
      coverDraw(ctx, img, segX + SEAM, 0, ATLAS_SEG - SEAM * 2, ATLAS_H);
    });
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);
}

function useMarbleTextTexture(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, font: string) {
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
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d')!;
        drawMarble(ctx, 0, 0, canvas.width, canvas.height, 2);
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
  const images = useMemo(
    () => [altays.image as HTMLImageElement, apex.image as HTMLImageElement, eclat.image as HTMLImageElement],
    [altays, apex, eclat]
  );

  const sideAtlas = useSideAtlas(images);
  const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(CIRCUM_RADIUS, CIRCUM_RADIUS, HEIGHT, 3, 1, false), []);

  const sideMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: sideAtlas,
        emissiveMap: sideAtlas,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.1,
        roughness: 0.55,
        metalness: 0,
        clearcoat: 0.35,
        clearcoatRoughness: 0.3,
        envMapIntensity: 0.12,
      }),
    [sideAtlas]
  );

  // One strong word, engraved: "itqan" — mastery, doing a craft to
  // perfection.
  const arabicTexture = useMarbleTextTexture((ctx, w, h) => {
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(w * 0.32)}px "Noto Naskh Arabic", serif`;
    const x = w / 2;
    const y = h / 2 + h * 0.03;
    // Recessed-engraving look: a soft dark shadow offset down-right
    // (the carved groove) and a crisp light rim offset up-left (the
    // catch-light on the cut edge), both tight to the letterforms so
    // they read as depth, not a double-printed smear.
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1.5;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'rgba(6,5,4,0.95)';
    ctx.fillText('إتقان', x, y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(214,204,188,0.3)';
    ctx.fillText('إتقان', x - 0.7, y - 0.7);
  }, '175px "Noto Naskh Arabic"');

  const monogramTexture = useMarbleTextTexture((ctx, w, h) => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(w * 0.26)}px "Fraunces Variable", Georgia, serif`;
    const x = w / 2;
    const y = h / 2 + h * 0.02;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = 'rgba(6,5,4,0.95)';
    ctx.fillText('RI', x, y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(214,204,188,0.5)';
    ctx.fillText('RI', x - 1.5, y - 1.5);
  }, '150px "Fraunces Variable"');

  const capMaterialProps = {
    roughness: 0.82,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.28,
    // Zero, deliberately: this near-horizontal surface faces the
    // overhead Lightformer almost head-on, and any IBL contribution
    // (which also drives the clearcoat reflection) blows it out to
    // flat white. Verified by direct screenshot comparison — do not
    // raise this without re-checking visually.
    envMapIntensity: 0,
  };

  const topMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...capMaterialProps,
        map: arabicTexture ?? undefined,
        color: arabicTexture ? '#ffffff' : MARBLE_BASE,
      }),
    [arabicTexture]
  );
  const bottomMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...capMaterialProps,
        map: monogramTexture ?? undefined,
        color: monogramTexture ? '#ffffff' : MARBLE_BASE,
      }),
    [monogramTexture]
  );

  const materials = useMemo(() => [sideMaterial, topMaterial, bottomMaterial], [sideMaterial, topMaterial, bottomMaterial]);

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
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 3, 3]} intensity={0.65} />
      <directionalLight position={[-2, 1, -2]} intensity={0.25} color={SILVER} />
      <Environment resolution={128}>
        <Lightformer intensity={0.45} color="white" position={[0, 3, -3]} scale={[7, 3, 1]} />
        <Lightformer intensity={0.3} color="white" position={[-3, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[3, 2, 1]} />
        <Lightformer intensity={0.3} color={SILVER} position={[3, 0.5, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 2, 1]} />
      </Environment>

      <mesh geometry={cylinderGeo} material={materials} />
    </group>
  );
}

import { useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Environment, Lightformer, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { withBase } from '../../lib/base';

const BRUSHED = '#c2b59b';

function buildBilletGeometry() {
  const s = 0.6; // half face size
  const c = 0.16; // corner chamfer
  const shape = new THREE.Shape();
  shape.moveTo(-s + c, -s);
  shape.lineTo(s - c, -s);
  shape.lineTo(s, -s + c);
  shape.lineTo(s, s - c);
  shape.lineTo(s - c, s);
  shape.lineTo(-s + c, s);
  shape.lineTo(-s, s - c);
  shape.lineTo(-s, -s + c);
  shape.closePath();

  const bore = new THREE.Path();
  bore.absarc(0, 0, 0.16, 0, Math.PI * 2, false);
  shape.holes.push(bore);

  const slotR = 0.36;
  [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((a) => {
    const cx = Math.cos(a) * slotR;
    const cy = Math.sin(a) * slotR;
    const w = 0.16;
    const h = 0.06;
    const pts: [number, number][] = [
      [-w / 2, -h / 2],
      [w / 2, -h / 2],
      [w / 2, h / 2],
      [-w / 2, h / 2],
    ];
    const rotated = pts.map(([x, y]) => [
      x * Math.cos(a) - y * Math.sin(a) + cx,
      x * Math.sin(a) + y * Math.cos(a) + cy,
    ]);
    const path = new THREE.Path();
    path.moveTo(rotated[0][0], rotated[0][1]);
    for (let i = 1; i < rotated.length; i++) path.lineTo(rotated[i][0], rotated[i][1]);
    path.closePath();
    shape.holes.push(path);
  });

  const faceWidth = s * 2;
  const depth = faceWidth * 1.6;

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.015,
    bevelThickness: 0.015,
    bevelSegments: 4,
    curveSegments: 12,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

export default function ControlMesh({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const [hovering, setHovering] = useState(false);
  const startTime = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const damped = useRef({ x: 0, y: 0 });
  const spin = useRef({ x: 0, y: 0.55, z: 0 });

  const geometry = useMemo(() => buildBilletGeometry(), []);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - startTime.current;

    const settle = Math.min(1, t / 1.1);
    const ease = 1 - Math.pow(1 - settle, 3);
    group.current.scale.setScalar(reduceMotion ? 0.62 : 0.62 * (0.85 + 0.15 * ease));

    if (!reduceMotion) {
      // Full continuous 360° rotation, horizontal (yaw/Y) and vertical
      // (pitch/X) — two independent axes at non-matching speeds so the
      // combined orientation never repeats on a short cycle. Slows while
      // hovered so cursor-tilt reads clearly, but never fully stops.
      const spinScale = hovering ? 0.35 : 1;
      spin.current.y += delta * ((Math.PI * 2) / 13) * spinScale; // full horizontal turn ~13s
      spin.current.x += delta * ((Math.PI * 2) / 21) * spinScale; // full vertical turn ~21s

      // Cursor tilt layers on top as an additive offset, not a replacement.
      const lerpSpeed = hovering ? 0.1 : 0.04;
      damped.current.x += (target.current.x - damped.current.x) * lerpSpeed;
      damped.current.y += (target.current.y - damped.current.y) * lerpSpeed;
      if (!hovering) {
        damped.current.x += (0 - damped.current.x) * 0.03;
        damped.current.y += (0 - damped.current.y) * 0.03;
      }

      group.current.rotation.x = spin.current.x + damped.current.x;
      group.current.rotation.y = spin.current.y + damped.current.y;
    } else {
      group.current.rotation.set(0.15, 0.55, 0);
    }
  });

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (reduceMotion) return;
    setHovering(true);
    const nx = (e.uv ? e.uv.x - 0.5 : 0) * 2;
    const ny = (e.uv ? e.uv.y - 0.5 : 0) * 2;
    target.current.y = -nx * 0.3;
    target.current.x = ny * 0.22;
  }

  function handlePointerLeave() {
    setHovering(false);
  }

  function handleClick() {
    window.location.href = withBase('/projects');
  }

  return (
    <>
      <ambientLight intensity={0.22} />
      <Environment resolution={256}>
        <Lightformer intensity={1.4} color="white" position={[1.2, 2.4, 1.6]} rotation={[0, 0, Math.PI / 6]} scale={[0.15, 6, 1]} />
        <Lightformer intensity={0.55} color="white" position={[0, 1.8, -1]} rotation={[Math.PI / 2, 0, 0]} scale={[0.1, 5, 1]} />
        <Lightformer intensity={0.2} color={BRUSHED} position={[0, 0, 4]} scale={[4, 4, 1]} />
      </Environment>

      <group
        ref={group}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}>
        <mesh geometry={geometry} castShadow>
          <meshPhysicalMaterial
            color={BRUSHED}
            metalness={1}
            roughness={0.33}
            envMapIntensity={1.4}
            // @ts-expect-error anisotropy is supported at runtime (three >=0.162) but not yet in @types/three's JSX props
            anisotropy={0.65}
            anisotropyRotation={Math.PI / 2}
          />
        </mesh>
      </group>

      <ContactShadows position={[0, -0.6, 0]} opacity={0.35} blur={2.6} scale={4} far={2} />
    </>
  );
}

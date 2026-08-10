import { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import PrismMesh from './PrismMesh';
import './HeroVisual.css';

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function ToneMapping() {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl]);
  return null;
}

function scrollToWork() {
  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
}

export default function HeroVisual() {
  const [ready, setReady] = useState(false);
  const [canRender3D, setCanRender3D] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    setIsNarrow(window.matchMedia('(max-width: 767px)').matches);
    setCanRender3D(supportsWebGL());
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="hero-visual__stage" aria-hidden="true" />;
  }

  return (
    <div className="hero-visual">
      {canRender3D ? (
        <div
          className="hero-visual__stage"
          role="button"
          tabIndex={0}
          aria-label="See the work"
          onClick={scrollToWork}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && scrollToWork()}>
          <Canvas
            dpr={isNarrow ? [1, 1.5] : [1, 2]}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 0, 5], fov: 36 }}
            style={{ background: 'transparent' }}>
            <ToneMapping />
            <Suspense fallback={null}>
              <PrismMesh reduceMotion={reduceMotion} />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <MetalSurfaceFallback onClick={scrollToWork} />
      )}
    </div>
  );
}

function MetalSurfaceFallback({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="hero-visual__stage hero-visual__fallback"
      role="button"
      tabIndex={0}
      aria-label="See the work"
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}>
      <div className="hero-visual__sheen" />
    </div>
  );
}

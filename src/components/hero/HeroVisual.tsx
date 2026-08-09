import { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ControlMesh from './ControlMesh';
import { withBase } from '../../lib/base';
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

  function goToProjects() {
    window.location.href = withBase('/projects');
  }

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
          aria-label="View projects"
          onClick={goToProjects}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goToProjects()}>
          <Canvas
            dpr={isNarrow ? [1, 1.5] : [1, 2]}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 0.3, 3.2], fov: 30 }}
            style={{ background: 'transparent' }}>
            <ToneMapping />
            <Suspense fallback={null}>
              <ControlMesh reduceMotion={reduceMotion} />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        <MetalSurfaceFallback onClick={goToProjects} />
      )}
      <a href={withBase('/projects')} className="hero-visual__caption">
        <span className="hero-visual__caption-rule" aria-hidden="true" />
        Selected work
      </a>
    </div>
  );
}

function MetalSurfaceFallback({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="hero-visual__stage hero-visual__fallback"
      role="button"
      tabIndex={0}
      aria-label="View projects"
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}>
      <div className="hero-visual__sheen" />
    </div>
  );
}

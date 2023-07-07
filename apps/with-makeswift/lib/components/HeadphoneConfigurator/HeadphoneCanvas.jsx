/* eslint-disable react/no-unknown-property */

import {
  CameraShake,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';

function Headphones({ materialColors, ...rest }) {
  const ref = useRef();
  const { nodes, materials } = useGLTF('headphones.glb');

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    ref.current.rotation.set(
      Math.cos(t / 4) / 8,
      Math.sin(t / 4) / 8,
      -0.2 - (1 + Math.sin(t / 1.5)) / 100,
    );
  });

  return (
    <group ref={ref} {...rest}>
      <mesh
        castShadow
        geometry={nodes.Base.geometry}
        material={materials.Base}
        material-color={materialColors.Base}
        receiveShadow
      />
      <mesh
        castShadow
        geometry={nodes.Head_Cushion.geometry}
        material={materials.Cushion}
        material-color={materialColors.Cushion}
        receiveShadow
      />
      <mesh
        castShadow
        geometry={nodes.Ear_Cushion.geometry}
        material={materials.Cushion}
        material-color={materialColors.Cushion}
        receiveShadow
      />
      <mesh
        castShadow
        geometry={nodes.Head_Cushion.geometry}
        material={materials.Cushion}
        material-color={materialColors.Cushion}
        receiveShadow
      />
      <mesh
        castShadow
        geometry={nodes.Mesh.geometry}
        material={materials.Mesh}
        material-color={materialColors.Mesh}
        receiveShadow
      />
      <mesh
        castShadow
        geometry={nodes.Speaker.geometry}
        material={materials.Speaker}
        material-color={materialColors.Speaker}
        receiveShadow
      />
    </group>
  );
}

export function HeadphoneCanvas({
  enableRotate = false,
  materialColors,
  onMaterialHover,
  onMaterialClick,
}) {
  return (
    <Canvas shadows>
      <ambientLight intensity={0.4} />
      <spotLight angle={0.1} castShadow intensity={0.5} penumbra={1} position={[10, 15, 10]} />
      <Environment preset="city" />
      <PerspectiveCamera fov={45} makeDefault position={[0, -10, 0]} />
      <OrbitControls enableRotate={enableRotate} enableZoom={false} makeDefault rotateSpeed={0.5} />
      <CameraShake
        decayRate={0.65} // if decay = true this is the rate at which intensity will reduce at />
        intensity={1} // initial intensity of the shake
        maxPitch={0.01} // Max amount camera can pitch in either direction
        maxRoll={0.01} // Max amount camera can roll in either direction
        maxYaw={0.01} // Max amount camera can yaw in either direction
        pitchFrequency={0.1} // Frequency of the pitch rotation
        rollFrequency={0.1} // Frequency of the roll rotation
        yawFrequency={0.1} // Frequency of the the yaw rotation
      />
      <Suspense fallback={null}>
        <Headphones
          materialColors={materialColors}
          onClick={(e) => {
            e.stopPropagation();

            onMaterialClick(e.object.material.name);
          }}
          onPointerMissed={() => onMaterialHover(null)}
          onPointerOut={(e) => e.intersections.length === 0 && onMaterialHover(null)}
          onPointerOver={(e) => {
            e.stopPropagation();

            onMaterialHover(e.object.material.name);
          }}
        />
      </Suspense>
    </Canvas>
  );
}

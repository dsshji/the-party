import { useGLTF, useAnimations, useTexture } from '@react-three/drei'
import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

// TODO: load more animations to glb existing + assign to diff characters diff idles / times

export default function Character({ url, rotation, position, imgURL }) {
  const texture = useTexture(imgURL ?? FALLBACK_TEXTURE_URL);
  const hasImage = Boolean(imgURL)
  const ref = useRef()
  const boneRef = useRef()
  const { scene, animations } = useGLTF(url)
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, ref)

  useEffect(() => {
    const firstAction = Object.values(actions)[0]
    firstAction?.play();
  }, [actions]);

  useEffect(() => {
    cloned.traverse((child) => {
      if (child.isBone && child.name === "mixamorigHead") {
        const worldScale = new THREE.Vector3()
        child.getWorldScale(worldScale)
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(0.7, 0.7),
          new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
        );
        plane.scale.set(1 / worldScale.x, 1 / worldScale.y, 1 / worldScale.z)
        plane.position.set(0, 15, 20);
        child.add(plane);
      }
    })
  }, [cloned, texture]);

  useEffect(() => {
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone()
        child.material.map = texture
      }
    })
  }, [cloned, texture]);

  return (
    <group position={position} rotation={rotation}>
      <primitive ref={ref} object={cloned} scale={2} />
    </group>
  )
}
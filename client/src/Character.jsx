import { useGLTF, useAnimations, useTexture, Html } from '@react-three/drei'
import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

// TODO: manage walk animation

// 1x1 gray pixel, used when an artist has no portrait image
const FALLBACK_TEXTURE_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

export default function Character({ url, rotation, position, imgURL, speaking, cardUnderRef, speaker, line }) {
  const texture = useTexture(imgURL ?? FALLBACK_TEXTURE_URL);
  const hasImage = Boolean(imgURL)
  const ref = useRef()
  const boneRef = useRef()
  const { scene, animations } = useGLTF(url)
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene])

  const { animations: talkAnims1 } = useGLTF('/Talking1.glb')
  const { animations: talkAnims2 } = useGLTF('/Talking2.glb')
  const { animations: talkAnims3 } = useGLTF('/Talking3.glb')
  const { animations: walkAnims } = useGLTF('/Walking.glb')
  
  const clips = useMemo(
    () => [...animations, ...talkAnims1, ...talkAnims2, ...talkAnims3, ...walkAnims],
    [animations, talkAnims1, talkAnims2, talkAnims3, walkAnims]
  )
  const { actions } = useAnimations(clips, ref)

const currentAction = useRef(null)

useEffect(() => {
  const [idle, talk1, talk2, talk3, walk] = Object.values(actions)

  let next
  if (speaking === 1) {
    const talkAnims = [talk1, talk2, talk3]
    next = talkAnims[Math.floor(Math.random() * talkAnims.length)]
  } else {
    next = idle
  }
  if (!next) return

  if (currentAction.current && currentAction.current !== next) {
    const prev = currentAction.current
    next.enabled = true
    next.setEffectiveTimeScale(1)
    next.setEffectiveWeight(1)
    next.reset().play()
    prev.crossFadeTo(next, 0.5, true)
  } else if (!currentAction.current) {
    next.reset().play()
  }

  currentAction.current = next
}, [actions, speaking])

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
      {speaking && (
        <Html position={[0, 4, 0]} center>
          <div className="card-under" ref={cardUnderRef}>
            <div className="card">
              <div className="card-content">
                <p className="dialogue">{line}</p>
              </div>
            </div>
          </div>
        </Html>
      )}

    </group>
  )
}
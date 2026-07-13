import { useGLTF, useAnimations, useTexture, Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

// TODO: manage walk animation

// 1x1 gray pixel, used when an artist has no portrait image
const FALLBACK_TEXTURE_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

export default function Character({ url, rotation, positionFin, imgURL, speaking, bubbleColor, line, index, onArrived }) {
  const texture = useTexture(imgURL ?? FALLBACK_TEXTURE_URL);
  const hasImage = Boolean(imgURL)
  const ref = useRef()
  const [hasArrived, setHasArrived] = useState(false)
  const groupRef = useRef()
  const targetPos = useMemo(() => new THREE.Vector3(...positionFin), [positionFin])
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
    const angle = rotation[1]
    const forward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle))
    const spawn = targetPos.clone().addScaledVector(forward, -6)
    spawn.y -= 0.5
    groupRef.current.position.copy(spawn)

    const walk = actions['walking']
    if (walk) {
      walk.reset().play()
      currentAction.current = walk
    }
  }, [])

  const WALK_SPEED = 2

  useFrame((_, delta) => {
    if (!groupRef.current || hasArrived) return
    const toTarget = targetPos.clone().sub(groupRef.current.position)
    const dist = toTarget.length()
    const step = WALK_SPEED * delta
    if (step >= dist) {
      groupRef.current.position.copy(targetPos)
      setHasArrived(true)
      onArrived?.()
      return
    }
    groupRef.current.position.addScaledVector(toTarget.normalize(), step)
  })

  useLayoutEffect(() => {
    if (!hasArrived) return
    const idle = actions['mixamo.com']
    const talkAnims = [actions['talking1.com'], actions['talking2.com'], actions['talking3.com']]

    let next
    if (speaking === 1) {
      next = talkAnims[Math.floor(Math.random() * talkAnims.length)]
    } else {
      next = idle
    }
    if (!next) return

    next.enabled = true
    next.setEffectiveTimeScale(1)
    next.setEffectiveWeight(1)
    next.reset().play()

    if (currentAction.current && currentAction.current !== next) {
      currentAction.current.crossFadeTo(next, 0.5, true)
    }

    currentAction.current = next
  }, [actions, speaking, hasArrived])

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
    <group ref={groupRef} rotation={rotation}>
      <primitive ref={ref} object={cloned} scale={1.7} />
      {speaking && (
        <Html position={[0, 4, 0]} center>
          <div className="card-under" style={{ "--bubble-color": bubbleColor }}>
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
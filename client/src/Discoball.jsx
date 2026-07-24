import { useGLTF, useTexture, Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

const FALLBACK_TEXTURE_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

function buildBallEnvMap(gl) {
  const envScene = new THREE.Scene()
  envScene.background = new THREE.Color('#05060a')

  const emitter = (color, intensity, pos, size) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) })
    )
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    envScene.add(m)
  }

  const palette = ['#ff018f', '#00e5ff', '#ffcc00', '#ffffff', '#ff018f', '#00e5ff']
  const R = 40
  const count = 40
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = i * 2.399963
    const pos = [Math.cos(theta) * r * R, y * R, Math.sin(theta) * r * R]
    const color = palette[i % palette.length]
    emitter(color, 8, pos, 2)
  }

  const pmrem = new THREE.PMREMGenerator(gl)
  const envMap = pmrem.fromScene(envScene, 0.01).texture
  pmrem.dispose()
  return envMap
}

export default function Discoball({ spinning, showPanel = false, imgURL, panelOffset = 1.4, panelScale = 1, ...props }) {
  const ref = useRef()
  const groupRef = useRef()
  const panelRef = useRef()
  const { gl, camera } = useThree()
  const { scene } = useGLTF('/Discoball.glb')
  const texture = useTexture(imgURL ?? FALLBACK_TEXTURE_URL)

  const envMap = useMemo(() => buildBallEnvMap(gl), [gl])

  const ball = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      if (!o.isMesh) return
      o.material = new THREE.MeshStandardMaterial({
        color: '#c8ccd6',
        metalness: 1,
        roughness: 0.18,
        envMap,
        envMapIntensity: 1.6,
        emissive: '#181c26',
        emissiveIntensity: 1,
        flatShading: true,
      })
    })
    return clone
  }, [scene, envMap])

  useEffect(() => () => envMap?.dispose(), [envMap])

  useFrame((_, delta) => {
    if (spinning && ref.current) ref.current.rotation.y += 1.5*delta

    if (showPanel && panelRef.current && groupRef.current) {
      const center = groupRef.current.getWorldPosition(new THREE.Vector3())
      const toCam = camera.position.clone().sub(center).normalize()
      panelRef.current.position.copy(center).addScaledVector(toCam, panelOffset)
      panelRef.current.quaternion.copy(camera.quaternion)
    }
  })

  return (
    <>
      <group ref={groupRef} {...props}>
        {/* only the ball spins */}
        <group ref={ref}>
          <primitive object={ball} />
        </group>
      </group>
      {/* song-image panel: only during TRACK_PLAY, always facing the camera */}
      {showPanel && (
        <mesh ref={panelRef} scale={panelScale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      )}
    </>
  )
}
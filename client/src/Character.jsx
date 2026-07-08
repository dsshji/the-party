import { useGLTF, useAnimations } from '@react-three/drei'
import { useRef } from 'react'

export default function Character({ url, position }) {
  const ref = useRef()
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, ref)
  
  // play idle animation when component mounts
  // think: what hook runs code on mount?
  
  return <primitive ref={ref} object={scene} position={position} />
}
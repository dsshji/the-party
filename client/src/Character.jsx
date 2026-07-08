import { useGLTF, useAnimations } from '@react-three/drei'
import { useRef, useEffect } from 'react'

export default function Character({ url, position }) {
  const ref = useRef()
  const { scene, animations } = useGLTF(url)
  const { actions } = useAnimations(animations, ref)

  useEffect(() => {
    actions['mixamo.com']?.play();
  }, [actions]);

  return <primitive ref={ref} object={scene} scale={2} position={position} />
}
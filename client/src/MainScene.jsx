import { useLocation, useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, SpotLight  } from '@react-three/drei'
import Character from './Character.jsx'
import * as THREE from 'three'

function Stage(props) {
  const { scene } = useGLTF('/stage.glb')
  return <primitive object={scene} {...props} />
}

/*
function Lights({ pos, ...props }) {
  return <SpotLight
    ref={(light) => {
      if (light) {
        light.target.position.set(...pos)
        light.target.updateMatrixWorld()
      }
    }}
    intensity={300}
    distance={12}
    angle={0.5} 
    penumbra={0.9}
    volumetric={true}
    opacity={0.4}
    anglePower={8}
    {...props}
  />
}
*/

function DimmableSpot({ active = true, full = 400, pos, ...props }) {
  const ref = useRef()
  const cone = useRef()

  useEffect(() => {
    if (!ref.current || !pos) return
    pos[2] -= 0.5
    ref.current.target.position.set(...pos)
    ref.current.target.updateMatrixWorld()
  }, [pos[0], pos[1], pos[2]])

  useFrame((_, delta) => {
    if (!ref.current) return

    if (!cone.current) {
      ref.current.traverse(o => {
        if (o.material?.uniforms?.opacity) cone.current = o.material
      })
    }

    ref.current.intensity = THREE.MathUtils.damp(ref.current.intensity, active ? full : 0, 5, delta)

    if (cone.current) {
      cone.current.uniforms.opacity.value = THREE.MathUtils.damp(
        cone.current.uniforms.opacity.value,
        active ? 0.4 : 0,
        5,
        delta
      )
    }
  })

  return <SpotLight ref={ref} intensity={0} distance={12} angle={0.5} penumbra={0.9}
    volumetric opacity={0.4} anglePower={8} {...props} />
}

function Confetti(props) {
  const { scene } = useGLTF('/confetti.glb')
  const ref = useRef()
  
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * 0.3
  })

  return <primitive ref={ref} object={scene} {...props} />
}

function stagePos(i, n) {
  return [(i - (n - 1) / 2) * 1.5, -2.5, -0.5]
}

export default function MainScene() {
  const [arrived, setArrived] = useState(new Set())
  const [settled, setSettled] = useState(new Set())
  const [trackReady, setTrackReady] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  //TODO: add sessionsStorage persistance
  const [partyData, setPartyData] = useState(location.state?.data ?? null)
  const [artistsData, setArtistsData] = useState(location.state?.artists ?? null)

  useEffect(() => {
    if (partyData === null) {
      const parsed = JSON.parse(window.sessionStorage.getItem('script') ?? 'null')
      if (parsed !== null) {
        const artParsed = JSON.parse(window.sessionStorage.getItem('artists') ?? 'null')
        setPartyData(parsed)
        setArtistsData(artParsed)
      }
      else navigate('/')
    }
  }, [])

  const PHASES = ['ARRIVAL', 'TRACK_PLAY', 'ARTIST_DOMINANT', 'PARTY_END']

  // FOR DEBUG
  console.log(partyData)

  const [phase, setPhase] = useState(0)
  const [index, setIndex] = useState(0)
  // for TRACK_PLAY phase
  const [trackNum, setTrack] = useState(0)

  const chunk = partyData ? partyData[PHASES[phase]] : null

  if (partyData === null || artistsData === null) return null

  const REL_COLORS = {
    ally: "var(--rel-ally)",
    opposite: "var(--rel-opposite)",
    outlier: "var(--rel-outlier)",
  }
  const bubbleColor = phase === 0
    ? (REL_COLORS[chunk[index].relationship] ?? "var(--rel-outlier)")
    : "var(--rel-neutral)"

  let speaker = ''
  let line = ''
  let target = ''

  if (phase === 1) {
    speaker = chunk[trackNum].dialogues[index].speaker
    line = chunk[trackNum].dialogues[index].line
    target = ''
  } else if (phase === 3) {
    speaker = chunk.dialogues[index].speaker
    line = chunk.dialogues[index].line
    target = ''
  } else if (phase === 0) {
    speaker = chunk[index].speaker
    line = chunk[index].line
    target = chunk[index].target
  } else {
    speaker = chunk[index].speaker
    line = chunk[index].line
    target = ''
  }

  // for TRACK_PLAY phase
  useEffect(() => {
    if (phase !== 1) return
    setTrackReady(false)
    const t = setTimeout(() => setTrackReady(true), 10000)
    return () => clearTimeout(t)
  }, [phase, trackNum])

  function handleClick() {
    if (phase !== 0 && index !== 0 && !dialogueLive) return
    if (phase === 0) {
      if (!arrived.has(speaker)) {
        setArrived(prev => new Set(prev).add(speaker))
        return
      }
      if (!settled.has(speaker)) return
      if (index === chunk.length - 1) {
        setPhase(phase + 1)
        setIndex(0)
      } else {
        setIndex(index + 1)
      }
      return
    }
    if (phase === 1) {
      if (index < chunk[trackNum].dialogues.length - 1) setIndex(index + 1)
      else if (index === chunk[trackNum].dialogues.length - 1) {
        setTrack(trackNum + 1)
        setIndex(0)
      }
      if (trackNum === chunk.length - 1) {
        setPhase(phase + 1)
        setIndex(0)
      }
    }
    else if (phase === 3 && index === chunk.dialogues.length - 1) {
      navigate('/end')
      setPhase(0)
      setIndex(0)
      setTrack(0)
    }

    else if (index === chunk.length - 1) {
      setPhase(phase + 1)
      setIndex(0)
    }
    else setIndex(index + 1)
  }

  const dialogueLive =
    phase === 0 ? settled.has(speaker) && (!target || settled.has(target)) :
    phase === 1 ? trackReady :
    true

  const lit = dialogueLive ? new Set([speaker, target].filter(Boolean)) : new Set()
  const anyoneSpeaking = lit.size > 0

  return (
    <>
      <div className="hero-content" onClick={handleClick}>
        
        <Canvas style={{ width: '100%', height: '90vh'}} camera={{ position: [0, 0, 5.5] }}>
          <ambientLight intensity={0.3} />
          <Suspense fallback={null}>
            <Confetti scale={1} position={[0, 0.8, 1.8]} rotation={[0, 4.6, 0]} />
          </Suspense>
          <directionalLight position={[3, 5, 2]} intensity={0.7} />
          <DimmableSpot opacity={anyoneSpeaking ? 0.05 : 0.4} full={anyoneSpeaking ? 60 : 400} pos={[2, -4, -2.5]} position={[0, 3, 0]} color={'#ff018f'} />
          <DimmableSpot opacity={anyoneSpeaking ? 0.05 : 0.4} full={anyoneSpeaking ? 60 : 400} pos={[-2, -4, -2.5]} position={[0, 3, 0]} color={'#00e5ff'} />
          <DimmableSpot opacity={anyoneSpeaking ? 0.05 : 0.4} full={anyoneSpeaking ? 60 : 400} pos={[0, -3, -4.5]} position={[0, 3, 0]} color={'#ffcc00'} />
          <Suspense fallback={null}>
            <Stage scale={0.6} position={[-0.3, -3.7, -3.5]} rotation={[0, 1.75, -0.02]}/>
          </Suspense>
          { artistsData.filter(a => arrived.has(a.id)).map((artist) => {
            const i = artistsData.indexOf(artist)
            return (
              <Suspense key={artist.id} fallback={null}>
                <DimmableSpot angle={0.25} active={lit.has(artist.id)} pos={ stagePos(i, artistsData.length) } position={[0, 3, 0]} color={'#fff'} />
                <Character
                  url="/man.glb"
                  rotation={[0, i === (artistsData.length - 1) / 2 ? 0 : i < (artistsData.length - 1) / 2 ? 1 : -1, 0]}
                  positionFin={ stagePos(i, artistsData.length) }
                  imgURL={artist.image}
                  speaking={ artist.id === speaker && dialogueLive ? 1 : 0 }
                  bubbleColor={bubbleColor}
                  line={line}
                  index={[i, artistsData.length]}
                  onArrived={() => setSettled(prev => prev.has(artist.id) ? prev : new Set(prev).add(artist.id))}
                />
              </Suspense>
            )
          })}
        </Canvas>
      </div>

      <footer className="page-footer">
        <p className="footer-text">all rights reserved</p>
        <a className="footer-text" href='https://github.com/dsshji'>created by dsshji</a>
      </footer>
    </>
  )
}
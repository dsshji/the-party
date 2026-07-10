import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, SpotLight  } from '@react-three/drei'
import Character from './Character.jsx'

function Stage(props) {
  const { scene } = useGLTF('/stage.glb')
  return <primitive object={scene} {...props} />
}

function Lights({ pos, ...props }) {
  return <SpotLight
    ref={(light) => {
      if (light) {
        light.target.position.set(...pos)
        light.target.updateMatrixWorld()
      }
    }}
    intensity={400}
    distance={12}
    angle={0.55} 
    penumbra={0.9}
    volumetric={true}
    opacity={0.4}
    anglePower={8}
    {...props}
  />
}

export default function MainScene() {
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

  if (phase === 1) {
    speaker = chunk[trackNum].dialogues[index].speaker
    line = chunk[trackNum].dialogues[index].line
  } else if (phase === 3) {
    speaker = chunk.dialogues[index].speaker
    line = chunk.dialogues[index].line
  } else {
    speaker = chunk[index].speaker
    line = chunk[index].line
  }

  function handleClick() {
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

  return (
    <>
      <div className="hero-content" onClick={handleClick}>
        
        <Canvas style={{ width: '100%', height: '85vh'}} camera={{ position: [0, 0, 5.5] }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 2]} intensity={1} />
          <Lights pos={[2, -4, -3]} position={[0, 3, 0]} color={'#ff018f'} />
          <Lights pos={[-2, -4, -3]} position={[0, 3, 0]} color={'#00e5ff'} />
          <Lights pos={[0, -3, -4.5]} position={[0, 3, 0]} color={'#ffcc00'} />
          <Suspense fallback={null}>
            <Stage scale={0.6} position={[-0.3, -3.7, -3.5]} rotation={[0, 1.75, -0.02]}/>
          </Suspense>
          <Suspense fallback={null}>
            {artistsData.map((artist, i) => (
              <Character
                key={artist.id}
                url="/man.glb"
                rotation={[0, i === (artistsData.length - 1) / 2 ? 0 : i < (artistsData.length - 1) / 2 ? 1 : -1, 0]}
                position={[(i - (artistsData.length - 1) / 2) * 1.5, -2.5, -0.5]}
                imgURL={artist.image}
                speaking={ artist.id === speaker ? 1 : 0}
                bubbleColor={bubbleColor}
                speaker={speaker}
                line={line}
              />
            ))}
          </Suspense>
        </Canvas>
      </div>

      <footer className="page-footer">
        <p className="footer-text">all rights reserved</p>
        <p className="footer-text">created by dsshji</p>
      </footer>
    </>
  )
}
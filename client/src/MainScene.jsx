import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Character from './Character.jsx'

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
  const cardUnderRef = useRef(null)

  const chunk = partyData ? partyData[PHASES[phase]] : null

  useEffect(() => {
    if (!chunk || !cardUnderRef.current) return
    if (phase !== 0) {
      cardUnderRef.current.style.setProperty("background-color", "var(--rel-neutral)")
      return
    }
    const relationship = chunk[index].relationship
    if (relationship === "ally") cardUnderRef.current.style.setProperty("background-color", "var(--rel-ally)")
    else if (relationship === "opposite") cardUnderRef.current.style.setProperty("background-color", "var(--rel-opposite)")
    else cardUnderRef.current.style.setProperty("background-color", "var(--rel-outlier)")
  }, [phase, index, chunk])

  if (partyData === null || artistsData === null) return null

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
        <div className="card-under" ref={cardUnderRef}>
          <div className="card">
            <div className="card-content">
              <p className="dialogue">{speaker}</p>
              <p className="dialogue">{line}</p>
            </div>
          </div>
        </div>
        
        <Canvas style={{ width: '100%', height: '60vh'}} camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 2]} intensity={1} />
          <Suspense fallback={null}>
            {artistsData.map((artist, i) => (
              <Character
                key={artist.id}
                url="/man.glb"
                rotation={[0, i === (artistsData.length - 1) / 2 ? 0 : i < (artistsData.length - 1) / 2 ? 1 : -1, 0]}
                position={[(i - (artistsData.length - 1) / 2) * 2, -2, 0]}
                imgURL={artist.image}
                speaking={ artist.id === speaker ? 1 : 0}
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
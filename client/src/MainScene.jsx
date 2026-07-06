import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

export default function MainScene() {
  const location = useLocation()
  const navigate = useNavigate()
  //TODO: add sessionsStorage persistance
  const [partyData, setPartyData] = useState(location.state?.data ?? null)
  useEffect(() => {
    if (partyData === null) {
      const parsed = JSON.parse(window.sessionStorage.getItem('script') ?? 'null')
      if (parsed !== null) setPartyData(parsed)
      else navigate('/')
    }
  }, [])

  const PHASES = ['ARRIVAL', 'TRACK_PLAY', 'ARTIST_DOMINANT', 'PARTY_END']

  const [phase, setPhase] = useState(0)
  const [index, setIndex] = useState(0)
  // for TRACK_PLAY phase
  const [trackNum, setTrack] = useState(0)
  const cardUnderRef = useRef(null)

  if (partyData === null) return null

  const chunk = partyData[PHASES[phase]]
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

  useEffect(() => {
    if (phase !== 0 || !cardUnderRef.current) {
      cardUnderRef.current.style.setProperty("background-color", "var(--rel-neutral)")
      return
    }
    const relationship = chunk[index].relationship
    if (relationship === "ally") cardUnderRef.current.style.setProperty("background-color", "var(--rel-ally)")
    else if (relationship === "opposite") cardUnderRef.current.style.setProperty("background-color", "var(--rel-opposite)")
    else cardUnderRef.current.style.setProperty("background-color", "var(--rel-outlier)")
  }, [phase, index, chunk])

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
    else if (phase === 3 && index === chunk.dialogues.length - 1) navigate('/end');
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
      </div>

      <footer className="page-footer">
        <p className="footer-text">all rights reserved</p>
        <p className="footer-text">created by dsshji</p>
      </footer>
    </>
  )
}

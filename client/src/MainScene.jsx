import { useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function MainScene() {
  const location = useLocation()
  //TODO: add sessionsStorage persistance
  const partyData = location.state?.data

  const PHASES = ['ARRIVAL', 'TRACK_PLAY', 'ARTIST_DOMINANT', 'PARTY_END']

  const [phase, setPhase] = useState(0)
  const [index, setIndex] = useState(0)
  // for TRACK_PLAY phase
  const [trackNum, setTrack] = useState(0)

  const chunk = partyData[PHASES[phase]]
  let speaker = ''
  let line = ''

  if (phase === 1) {
    speaker = chunk[trackNum].dialogues[index].speaker
    line = chunk[trackNum].dialogues[index].line
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
      if (trackNum === chunk.length) {
        setPhase(phase + 1)
        setIndex(0)
      }
    }
    else if (index === chunk.length - 1) {
      setPhase(phase + 1)
      setIndex(0)
    }
    else setIndex(index + 1)
  }

  return (
    <>
      <div className="hero-content">
        <h2>Guests fetched</h2>
      </div>

      <p>{speaker}</p>
      <p>{line}</p>
      <button onClick={() => handleClick()}>Next</button>

      <footer className="page-footer">
        <p className="footer-text">all rights reserved</p>
        <p className="footer-text">created by dsshji</p>
      </footer>
    </>
  )
}

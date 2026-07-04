import axios from 'axios'
import { useEffect } from 'react'

const SPOTIFY_SCRIPT = 'http://127.0.0.1:8000/script'

export default function LoadingPage({ onNext, onData }) {
  useEffect(() => {
    axios.get(SPOTIFY_SCRIPT)
      .then(response => { onData(response.data); onNext() })
      .catch(error => console.log(error))
  }, [])

  return (
    <>
      <div className="hero-content">
        <h2>Waiting for your guests</h2>
      </div>

      <footer className="page-footer">
        <p>all rights reserved</p>
        <p>created by dsshji</p>
      </footer>
    </>
  )
}

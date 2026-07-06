import axios from 'axios'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SPOTIFY_SCRIPT = 'http://127.0.0.1:8000/script'

export default function LoadingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const parsed = JSON.parse(window.sessionStorage.getItem('script'))
    if (parsed !== null) {
      navigate('/main', { state: { data: parsed } })
    } else {
      axios.get(SPOTIFY_SCRIPT)
        .then(response => {
          window.sessionStorage.setItem('script', JSON.stringify(response.data))
          navigate('/main', { state: { data: response.data } })
        })
        .catch(error => console.log(error))
    }
  }, [])

  return (
    <>
      <div className="hero-content">
        <h2>Waiting for your guests</h2>
      </div>

      <footer className="page-footer">
        <p className="footer-text">all rights reserved</p>
        <p className="footer-text">created by dsshji</p>
      </footer>
    </>
  )
}

// TODO: with three.js wiring load spinning disco ball + text like "calling guests", "asking them to meet each other" etc in diff colors mapping
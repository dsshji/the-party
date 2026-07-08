import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SPOTIFY_SCRIPT = 'http://127.0.0.1:8000/script'

export default function LoadingPage() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const parsed = JSON.parse(window.sessionStorage.getItem('script') ?? 'null')
    const artParsed = JSON.parse(window.sessionStorage.getItem('artists') ?? 'null')
    if (parsed !== null) {
      navigate('/main', { state: { data: parsed, artists: artParsed } })
    } else {
      axios.get(SPOTIFY_SCRIPT, { withCredentials: true })
        .then(response => {
          window.sessionStorage.setItem('script', JSON.stringify(response.data.script))
          window.sessionStorage.setItem('artists', JSON.stringify(response.data.artists))
          navigate('/main', { state: { data: response.data.script, artists: response.data.artists } })
        })
        .catch(error => {
          console.log(error)
          const status = error.response?.status
          if (status === 401) {
            setError('Your Spotify session expired. Please log in again.')
          } else {
            setError('Something went wrong while calling your guests. Please try again.')
          }
        })
    }
  }, [])

  if (error) {
    return (
      <>
        <div className="hero-content">
          <h2>{error}</h2>
          <button className="gradient-btn" onClick={() => navigate('/login')}>Back to login</button>
        </div>

        <footer className="page-footer">
          <p className="footer-text">all rights reserved</p>
          <p className="footer-text">created by dsshji</p>
        </footer>
      </>
    )
  }

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
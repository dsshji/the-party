import { useNavigate } from 'react-router-dom'
import Button from './Button.jsx'

export default function StartPage() {
  const navigate = useNavigate()

  function handleStart() {
    const parsed = JSON.parse(window.sessionStorage.getItem('script') ?? 'null')
    if (parsed !== null) {
      const artists = JSON.parse(window.sessionStorage.getItem('artists') ?? 'null')
      navigate('/main', { state: { data: parsed, artists } })
    }
    else navigate('/login')
  }

  return (
    <>
      <div className="hero-content">
        <h1>THE PARTY</h1>
        <h2>What your top music will be like... partying?</h2>

        <Button eventButton={handleStart} textButton={"Let's party!"} />
      </div>

      <footer className="page-footer">
        <p className="footer-text">all rights reserved</p>
        <a className="footer-text" href='https://github.com/dsshji'>created by dsshji</a>
      </footer>
    </>
  )
}

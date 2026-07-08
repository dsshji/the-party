import { useNavigate } from 'react-router-dom'

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

        <div className="btn-wrapper">
          <div className="light"></div>
          <div
            className="gradient-layer"
            style={{  animationDelay: '0s', animationDuration: '25s'}}
          ></div>
          <div
            className="gradient-layer"
            style={{  animationDelay: '0.15s', animationDuration: '15.9s'}}
          ></div>
          <div
            className="gradient-layer"
            style={{  animationDelay: '0.53s', animationDuration: '26.4s'}}
          ></div>
          <div
            className="gradient-layer"
            style={{  animationDelay: '0.45s', animationDuration: '17.8s'}}
          ></div>
          <div
            className="gradient-layer"
            style={{  animationDelay: '1.6s', animationDuration: '19.2s'}}
          ></div>
          <div
            className="gradient-layer"
            style={{  animationDelay: '1.6s', animationDuration: '29.2s'}}
          ></div>
          <div
            className="gradient-layer"
            style={{  animationDelay: '1.6s', animationDuration: '20.2s'}}
          ></div>
          <button className="gradient-btn" onClick={handleStart}>Let's party!</button>
          <div className="text-overlay">Let's party!</div>
        </div>
      </div>

      <footer className="page-footer">
        <p className="footer-text">all rights reserved</p>
        <p className="footer-text">created by dsshji</p>
      </footer>
    </>
  )
}

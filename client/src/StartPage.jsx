import { useNavigate } from 'react-router-dom'

export default function StartPage() {
  const navigate = useNavigate()
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
          <button className="gradient-btn" onClick={() => navigate('/login')}>Let's party!</button>
          <div className="text-overlay">Let's party!</div>
        </div>
      </div>

      <footer className="page-footer">
        <p>all rights reserved</p>
        <p>created by dsshji</p>
      </footer>
    </>
  )
}

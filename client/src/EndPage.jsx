import { useNavigate } from 'react-router-dom'

export default function EndPage() {
  const navigate = useNavigate()
  //TODO: fix main state when called with the button

  return (
    <>
      <div className="hero-content">
        <h2>Party is over. Want to have fun again?</h2>


        <div className="btn-wrapper one">
          <div className="light"></div>
          <div
            className="gradient-layer"
            style={{  animationDelay: '0s', animationDuration: '25s'}}
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
            style={{  animationDelay: '1.6s', animationDuration: '20.2s'}}
          ></div>
          <button className="gradient-btn oneBtn" onClick={() => navigate('/main')}>Restart</button>
          <div className="text-overlay">Restart</div>
        </div>

        <div className="btn-wrapper two">
          <div className="light"></div>
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
          <button className="gradient-btn twoBtn" onClick={() => navigate('/')}>Go to the title</button>
          <div className="text-overlay">Go to the title</div>
        </div>

        <div className="btn-wrapper three">
          <div className="light"></div>
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
          <button className="gradient-btn threeBtn" onClick={() => window.location.href = 'https://github.com/dsshji/the-party'}>Star GitHub Repo</button>
          <div className="text-overlay">Star GitHub Repo</div>
        </div>
      </div>

      <footer className="page-footer">
        <p className="footer-text">all rights reserved</p>
        <p className="footer-text">created by dsshji</p>
      </footer>
    </>
  )
}

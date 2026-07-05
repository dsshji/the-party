import { useNavigate } from 'react-router-dom'

export default function EndPage() {
  //TODO: add go back button to the title page & button with the party restarted

  return (
    <>
      <div className="hero-content">
        <h2>Party is over. Want to have fun again?</h2>
        <button onClick={() => navigate('/main')}>Restart</button>
        <button onClick={() => navigate('/')}>Go to the title</button>
      </div>

      <footer className="page-footer">
        <p className="footer-text">all rights reserved</p>
        <p className="footer-text">created by dsshji</p>
      </footer>
    </>
  )
}

import { useLocation } from 'react-router-dom'

export default function MainScene() {
  const location = useLocation()
  //TODO: add sessionsStorage persistance
  const partyData = location.state?.data

  return (
    <>
      <div className="hero-content">
        <h2>Guests fetched</h2>
      </div>

      <footer className="page-footer">
        <p>all rights reserved</p>
        <p>created by dsshji</p>
      </footer>
    </>
  )
}

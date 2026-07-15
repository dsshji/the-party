import { useNavigate } from 'react-router-dom'
import Button from './Button.jsx'

export default function EndPage() {
  const navigate = useNavigate()
  //TODO: fix main state when called with the button

  return (
    <>
      <div className="hero-content">
        <h2>Party is over. Want to have fun again?</h2>


        <Button
          className="one"
          btnClassName="oneBtn"
          textButton="Restart"
          eventButton={() => navigate('/main')}
        />

        <Button
          className="two"
          btnClassName="twoBtn"
          textButton="Go to the title"
          eventButton={() => navigate('/')}
        />

        <Button
          className="three"
          btnClassName="threeBtn"
          textButton="Star GitHub Repo"
          eventButton={() => window.location.href = 'https://github.com/dsshji/the-party'}
        />
      </div>

      <footer className="page-footer">
        <p className="footer-text">all rights reserved</p>
        <a className="footer-text" href='https://github.com/dsshji'>created by dsshji</a>
      </footer>
    </>
  )
}

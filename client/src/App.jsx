import { useState } from 'react'
import './App.css'

import StartPage from './StartPage'
import LoginPage from './LoginPage'
import LoadingPage from './LoadingPage'
import MainScene from './MainScene'
// TODO: use react router to keep pages url to be able to go back forth

export default function App() {
  const [page, setPage] = useState('start')
  const [partyData, setPartyData] = useState(null)

  if (page === 'start') return <StartPage onNext={() => setPage('login')} />
  if (page === 'login') return <LoginPage onNext={() => setPage('loading')} />
  if (page === 'loading') return <LoadingPage onNext={() => setPage('main')} onData={setPartyData} />
}
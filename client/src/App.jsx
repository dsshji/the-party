import { useState } from 'react'
import './App.css'

import StartPage from './StartPage'
import LoginPage from './LoginPage'

export default function App() {
  const [page, setPage] = useState('start')

  if (page === 'start') return <StartPage onNext={() => setPage('login')} />
  if (page === 'login') return <LoginPage />
}
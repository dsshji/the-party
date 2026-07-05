import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import StartPage from './StartPage'
import LoginPage from './LoginPage'
import LoadingPage from './LoadingPage'
import MainScene from './MainScene'
import EndPage from './EndPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/main" element={<MainScene />} />
        <Route path="/end" element={<EndPage />} />
      </Routes>
    </BrowserRouter>
  );
}
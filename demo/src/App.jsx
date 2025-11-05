import { useState } from 'react'
import './App.css'
import Home from './pages/home'
import Chat from './pages/chat'
import Manager from './pages/manager'
import { Routes,Route } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/manager" element={<Manager />} />
          </Routes>
    </div>
  )
}

export default App

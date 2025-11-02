import { useState } from 'react'
import './App.css'
import Home from './pages/home'
import Chat from './pages/chat'
import Manager from './pages/manager'

function App() {
  const [count, setCount] = useState(0)

  return (
    //<Home />
    //<Chat />
    <Manager />
  )
}

export default App

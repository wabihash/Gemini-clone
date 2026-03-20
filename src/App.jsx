import React, { useEffect, useState } from 'react'
import Home from './Components/Home/Home'
import Sidebar from './Components/Sidebar/Sidebar'
import Main from './Components/Main/Main'

const PAGE_STORAGE_KEY = 'gemini_clone_current_page'

const readStoredPage = () => {
  try {
    const storedValue = localStorage.getItem(PAGE_STORAGE_KEY)
    return storedValue === 'gemini' ? 'gemini' : 'home'
  } catch {
    return 'home'
  }
}

const App = () => {
  const [currentPage, setCurrentPage] = useState(readStoredPage)

  useEffect(() => {
    localStorage.setItem(PAGE_STORAGE_KEY, currentPage)
  }, [currentPage])

  if (currentPage === 'home') {
    return <Home onAsk={() => setCurrentPage('gemini')} />
  }

  return (
    <div className="app">
      <Sidebar />
      <Main onBackHome={() => setCurrentPage('home')} />
    </div>
  )
}

export default App

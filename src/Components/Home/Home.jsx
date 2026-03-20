import React, { useState } from 'react'
import './Home.css'
import WabiEntrance from './WabiEntrance'
import ProjectDashboard from './ProjectDashboard'

const Home = ({ onAsk }) => {
  const [showDashboard, setShowDashboard] = useState(false)

  return (
    <main className="home-portfolio-page">
      <div className="portfolio-ambient glow-top-left" aria-hidden="true"></div>
      <div className="portfolio-ambient glow-top-right" aria-hidden="true"></div>
      <div className="portfolio-ambient glow-bottom" aria-hidden="true"></div>

      <ProjectDashboard onAsk={onAsk} />

      {!showDashboard ? <WabiEntrance onComplete={() => setShowDashboard(true)} /> : null}
    </main>
  )
}

export default Home

import React from 'react'
import { ArrowUpRight, Globe, Image as ImageIcon, Mic, Sparkles } from 'lucide-react'

const highlights = [
  {
    title: 'Smart Chat',
    description: 'Ask anything and get fast AI responses with polished conversation UI.',
    icon: Sparkles,
  },
  {
    title: 'Image Input',
    description: 'Upload one or more images and send them directly with your prompt.',
    icon: ImageIcon,
  },
  {
    title: 'Voice Prompt',
    description: 'Use microphone input to speak prompts and continue hands-free.',
    icon: Mic,
  },
]

const ProjectDashboard = ({ onAsk }) => {
  return (
    <section className="dashboard-shell">
      <header className="dashboard-hero">
        <p className="dashboard-kicker">Gemini Clone Homepage</p>
        <h1>
          Welcome to <span>Wabi&apos;s</span> Gemini Clone
        </h1>
        <p>
          A modern AI assistant experience with chat history, image uploads, voice input, and a
          clean responsive interface built for all screen sizes.
        </p>
        <div className="dashboard-actions">
          <button type="button" className="go-gemini" onClick={onAsk}>
            Ask Gemini <ArrowUpRight size={18} />
          </button>
          <div className="status-pill">
            <Globe size={14} />
            Open to Collaboration
          </div>
        </div>
      </header>

      <div className="feature-grid" aria-label="Gemini clone features">
        {highlights.map((item) => {
          const Icon = item.icon
          return (
            <article key={item.title} className="feature-card">
              <div className="feature-icon-wrap">
                <Icon size={20} />
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default ProjectDashboard

import React, { useContext, useState } from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { Context } from '../../Context/Context'

const Sidebar = () => {
  const [extended, setExtended] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { prevPrompts, onSent, newChat, activePage, setActivePage } = useContext(Context)

  const filteredPrompts = prevPrompts
    .slice()
    .reverse()
    .filter((item) => item.toLowerCase().includes(searchTerm.trim().toLowerCase()))

  const loadPrompt = async (prompt) => {
    await onSent(prompt, { saveToHistory: false })
  }

  const handleUtilityPage = (page) => {
    setActivePage(page)
  }

  const handleUtilityPageKeyDown = (event, page) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleUtilityPage(page)
    }
  }

  return (
    <div className={`sidebar ${extended ? 'expanded' : ''}`}>
      <div className="sidebar-top">
        <img
          onClick={() => setExtended((prev) => !prev)}
          className="menu"
          src={assets.menu_icon}
          alt=""
        />
      </div>

      <div className="sidebar-main">
        <div className="new-chat" onClick={newChat}>
          <img src={assets.plus_icon} alt="" />
          {extended ? <p>New Chat</p> : null}
        </div>

        {extended ? (
          <div className="recent-section">
            <p className="recent-title">Recent</p>

            <div className="recent-search">
              <span className="search-icon" aria-hidden="true"></span>
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="recent-scroll">
              {filteredPrompts.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="recent-entry"
                  onClick={() => loadPrompt(item)}
                >
                  <img src={assets.message_icon} alt="" />
                  <p>{item}</p>
                </div>
              ))}

              {!filteredPrompts.length ? <p className="recent-empty">No matching chats</p> : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="bottom">
        <div
          className={`bottom-item recent-entry ${activePage === 'help' ? 'is-active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => handleUtilityPage('help')}
          onKeyDown={(event) => handleUtilityPageKeyDown(event, 'help')}
        >
          <img src={assets.question_icon} alt="" />
          {extended ? <p>Help</p> : null}
        </div>
        <div
          className={`bottom-item recent-entry ${activePage === 'activity' ? 'is-active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => handleUtilityPage('activity')}
          onKeyDown={(event) => handleUtilityPageKeyDown(event, 'activity')}
        >
          <img src={assets.history_icon} alt="" />
          {extended ? <p>Activity</p> : null}
        </div>
        <div
          className={`bottom-item recent-entry ${activePage === 'settings' ? 'is-active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => handleUtilityPage('settings')}
          onKeyDown={(event) => handleUtilityPageKeyDown(event, 'settings')}
        >
          <img src={assets.setting_icon} alt="" />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  )
}

export default Sidebar

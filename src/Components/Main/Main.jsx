import React, { useContext, useRef, useState } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../Context/Context'

const Main = ({ onBackHome }) => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [copied, setCopied] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const {
    onSent,
    input,
    setInput,
    activePage,
    recentPrompt,
    showResult,
    loading,
    resultData,
    error,
    clearError,
    retryLastPrompt,
    recentImages,
  } = useContext(Context)

  const pageContent = {
    help: {
      icon: assets.question_icon,
      title: 'Help',
      description:
        'Guided support and tips are on the way. You will soon be able to discover shortcuts, prompts, and troubleshooting help here.',
    },
    activity: {
      icon: assets.history_icon,
      title: 'Activity',
      description:
        'Your timeline and account activity insights are coming soon. This page will show your recent actions and usage details.',
    },
    settings: {
      icon: assets.setting_icon,
      title: 'Settings',
      description:
        'Personalization and app preferences are coming soon. Soon you will manage theme, behavior, and connected features here.',
    },
  }

  const activePageContent = pageContent[activePage]
  const isUtilityPage = Boolean(activePageContent)

  const canShowSend = input.trim().length > 0

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = String(reader.result || '')
        const base64 = result.includes(',') ? result.split(',')[1] : ''
        resolve(base64)
      }
      reader.onerror = reject
    })
  }

  const handleGalleryClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || [])

    if (!selectedFiles.length) {
      return
    }

    const imageFiles = selectedFiles.filter((file) => file.type.startsWith('image/'))

    if (!imageFiles.length) {
      console.error('Please select an image file.')
      return
    }

    Promise.all(
      imageFiles.map(async (file) => {
        const previewUrl = URL.createObjectURL(file)
        const base64 = await fileToBase64(file)

        return {
          id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
          name: file.name,
          previewUrl,
          mimeType: file.type,
          base64,
        }
      })
    )
      .then((preparedImages) => {
        setUploadedFiles((prev) => [...prev, ...preparedImages])
      })
      .catch((error) => {
        console.error('Failed to read image file:', error)
      })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeUploadedFile = (id) => {
    setUploadedFiles((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl)
      }

      return prev.filter((item) => item.id !== id)
    })
  }

  const clearUploadedFiles = () => {
    uploadedFiles.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl)
      }
    })

    setUploadedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text && !uploadedFiles.length) {
      return
    }

    try {
      await onSent(text, {
        imageDataList: uploadedFiles.map((item) => ({
          base64: item.base64,
          mimeType: item.mimeType,
        })),
        imagePreviewUrls: uploadedFiles.map((item) => item.previewUrl),
      })

      clearUploadedFiles()
    } catch (error) {
      console.error('Gemini send failed:', error)
    }
  }

  const handleInputKeyDown = async (event) => {
    if (event.key === 'Enter') {
      await handleSend()
    }
  }

  const handleCardClick = async (prompt) => {
    try {
      await onSent(prompt)
    } catch (error) {
      console.error('Gemini card prompt failed:', error)
    }
  }

  const handleCardKeyDown = async (event, prompt) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      await handleCardClick(prompt)
    }
  }

  const handleCopyResponse = async () => {
    const plainText = String(resultData || '')
      .replace(/<[^>]*>/g, ' ')
      .trim()

    if (!plainText) {
      return
    }

    try {
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1300)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleRetry = async () => {
    try {
      await retryLastPrompt()
    } catch (error) {
      console.error('Retry failed:', error)
    }
  }

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.error('Voice input is not supported in this browser.')
      return
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        const transcript = String(event.results?.[0]?.[0]?.transcript || '').trim()
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
        }
      }

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)

      recognitionRef.current = recognition
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  return (
    <div className="main">
      <div className="nav">
        <p>Gemini</p>
        <div className="nav-actions">
          <button type="button" className="nav-home-btn" onClick={onBackHome}>
            Back Home
          </button>
          {!showResult ? <img src="/photo_2026-02-18_03-46-27%20k.jpg" alt="Profile" /> : null}
        </div>
      </div>
      <div className="main-container">
        <div className="main-content">
          {isUtilityPage ? (
            <div className="coming-soon">
              <div className="coming-soon-badge">Beta panel</div>
              <img src={activePageContent.icon} alt={activePageContent.title} />
              <h2>{activePageContent.title}</h2>
              <p>{activePageContent.description}</p>
              <span>Coming Soon</span>
            </div>
          ) : !showResult ? (
            <>
              <div className="greet">
                <p>
                  <span>Hello, Dev.</span>
                </p>
                <p>How can I help you today?</p>
              </div>
              <div className="cards">
                <div
                  className="card"
                  onClick={() =>
                    handleCardClick('Suggest beautiful places to see on an upcoming road trip')
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) =>
                    handleCardKeyDown(
                      event,
                      'Suggest beautiful places to see on an upcoming road trip'
                    )
                  }
                >
                  <p>Suggest beautiful places to see on an upcoming road trip</p>
                  <img src={assets.compass_icon} alt="" />
                </div>
                <div
                  className="card"
                  onClick={() => handleCardClick('Briefly summarize this concept: urban planning')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) =>
                    handleCardKeyDown(event, 'Briefly summarize this concept: urban planning')
                  }
                >
                  <p>Briefly summarize this concept: urban planning</p>
                  <img src={assets.bulb_icon} alt="" />
                </div>
                <div
                  className="card"
                  onClick={() =>
                    handleCardClick('Brainstorm team bonding activities for our work retreat')
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) =>
                    handleCardKeyDown(
                      event,
                      'Brainstorm team bonding activities for our work retreat'
                    )
                  }
                >
                  <p>Brainstorm team bonding activities for our work retreat</p>
                  <img src={assets.message_icon} alt="" />
                </div>
                <div
                  className="card"
                  onClick={() => handleCardClick('Improve the readability of the following code')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) =>
                    handleCardKeyDown(event, 'Improve the readability of the following code')
                  }
                >
                  <p>Improve the readability of the following code</p>
                  <img src={assets.code_icon} alt="" />
                </div>
              </div>
            </>
          ) : (
            <div className="result">
              <div className="result-title">
                <img src="/photo_2026-02-18_03-46-27%20k.jpg" alt="Profile" />
                <p>{recentPrompt}</p>
              </div>

              <div className="result-data">
                <img src={assets.gemini_icon} alt="" />
                <div className="result-body">
                  {recentImages?.length ? (
                    <div className="result-images">
                      {recentImages.map((item, index) => (
                        <img
                          key={`${item}-${index}`}
                          className="result-image"
                          src={item}
                          alt="Uploaded"
                        />
                      ))}
                    </div>
                  ) : null}
                  {loading ? (
                    <div className="loader">
                      <hr />
                      <hr />
                      <hr />
                    </div>
                  ) : (
                    <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
                  )}
                </div>
              </div>
              {!loading && resultData ? (
                <div className="result-actions">
                  <button type="button" onClick={handleCopyResponse}>
                    {copied ? 'Copied' : 'Copy response'}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
        {error ? (
          <div className="error-toast" role="alert" aria-live="polite">
            <p>{error}</p>
            <div className="error-toast-actions">
              <button type="button" onClick={handleRetry}>
                Retry
              </button>
              <button type="button" onClick={clearError}>
                Close
              </button>
            </div>
          </div>
        ) : null}
        {!isUtilityPage ? (
          <div className="main-bottom">
            <input
              ref={fileInputRef}
              className="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {uploadedFiles.length ? (
              <div className="image-preview-strip">
                {uploadedFiles.map((item) => (
                  <div key={item.id} className="image-preview-card">
                    <img src={item.previewUrl} alt={item.name} />
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(item.id)}
                      aria-label="Remove image"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="search-box">
              <input
                type="text"
                placeholder="Enter a prompt here"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              <div className="search-actions">
                <img
                  src={assets.gallery_icon}
                  alt="upload file"
                  title="Upload a file"
                  onClick={handleGalleryClick}
                />
                <img
                  src={assets.mic_icon}
                  alt="mic"
                  title={isListening ? 'Stop voice input' : 'Start voice input'}
                  className={isListening ? 'mic-active' : ''}
                  onClick={handleMicClick}
                />
                <img
                  src={assets.send_icon}
                  alt="send"
                  title="Send"
                  onClick={handleSend}
                  className={`send-icon ${canShowSend ? 'visible' : ''}`}
                />
              </div>
            </div>
            <p className="bottom-info">
              Gemini may display inaccurate info, including about people, so double-check its
              reliability.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Main

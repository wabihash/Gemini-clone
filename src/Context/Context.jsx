import { createContext, useEffect, useState } from 'react'
import runChat from '../Config/gemini'

export const Context = createContext()

const PROMPTS_STORAGE_KEY = 'gemini_clone_recent_prompts'

const readStoredPrompts = () => {
  try {
    const raw = localStorage.getItem(PROMPTS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const ContextProvider = (props) => {
  const [activePage, setActivePage] = useState('chat')
  const [recentPrompt, setRecentPrompt] = useState('')
  const [prevPrompts, setPrevPrompts] = useState(readStoredPrompts)
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultData, setResultData] = useState('')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [lastPrompt, setLastPrompt] = useState('')
  const [recentImages, setRecentImages] = useState([])
  const [lastImageDataList, setLastImageDataList] = useState([])
  const [lastImagePreviewList, setLastImagePreviewList] = useState([])

  useEffect(() => {
    localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prevPrompts))
  }, [prevPrompts])

  const onSent = async (prompt, options = {}) => {
    setActivePage('chat')
    const activePrompt = String(prompt ?? input).trim()
    const {
      saveToHistory = true,
      imageDataList = [],
      imagePreviewUrls = [],
      imageData = null,
      imagePreviewUrl = '',
    } = options

    const normalizedImageDataList = imageDataList.length
      ? imageDataList
      : imageData
        ? [imageData]
        : []

    const normalizedImagePreviewList = imagePreviewUrls.length
      ? imagePreviewUrls
      : imagePreviewUrl
        ? [imagePreviewUrl]
        : []

    if (!activePrompt && !normalizedImageDataList.length) {
      return ''
    }

    const historyPrompt = activePrompt || 'Image message'

    setResultData('')
    setError('')
    setLoading(true)
    setShowResult(true)
    setRecentPrompt(historyPrompt)
    setRecentImages(normalizedImagePreviewList)
    setLastPrompt(historyPrompt)
    setLastImageDataList(normalizedImageDataList)
    setLastImagePreviewList(normalizedImagePreviewList)

    if (saveToHistory) {
      // Keep history unique while moving the latest prompt to the end.
      setPrevPrompts((prev) => [...prev.filter((item) => item !== historyPrompt), historyPrompt])
    }

    try {
      const response = await runChat(activePrompt, { imageDataList: normalizedImageDataList })
      let formattedResponse = response

      // Convert **bold** to <b>bold</b>
      formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      // Convert remaining * markers to line breaks
      formattedResponse = formattedResponse.replace(/\*/g, '<br/>')

      setResultData(formattedResponse)
      return response
    } catch (apiError) {
      const rawMessage = String(apiError?.message || '')
      const isQuotaError =
        rawMessage.includes('[429') ||
        /quota exceeded|exceeded your current quota/i.test(rawMessage)

      if (isQuotaError) {
        const retryMatch =
          rawMessage.match(/retry in\s+([\d.]+)s/i) || rawMessage.match(/"retryDelay":"(\d+)s"/i)

        const retrySeconds = retryMatch ? Math.ceil(Number(retryMatch[1])) : null

        setError(
          retrySeconds
            ? `API Limit Reached. Please try again in ${retrySeconds}s.`
            : 'API Limit Reached. Please try again in a moment.'
        )
      } else {
        setError('Something went wrong. Please try again.')
      }

      throw apiError
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  const clearError = () => {
    setError('')
  }

  const retryLastPrompt = async () => {
    if (!lastPrompt) {
      return ''
    }

    return onSent(lastPrompt, {
      saveToHistory: false,
      imageDataList: lastImageDataList,
      imagePreviewUrls: lastImagePreviewList,
    })
  }

  const newChat = () => {
    setActivePage('chat')
    setLoading(false)
    setShowResult(false)
    setRecentPrompt('')
    setRecentImages([])
    setResultData('')
    setInput('')
    setError('')
    setLastImageDataList([])
    setLastImagePreviewList([])
  }

  const contextValue = {
    activePage,
    setActivePage,
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    setShowResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
    error,
    clearError,
    retryLastPrompt,
    recentImages,
  }

  return <Context.Provider value={contextValue}>{props.children}</Context.Provider>
}

export default ContextProvider

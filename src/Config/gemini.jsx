import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const MODEL_CANDIDATES = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

async function runChat(prompt, options = {}) {
  if (!API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY in your .env file')
  }

  const { imageDataList = [], imageData = null } = options

  const normalizedImageDataList = imageDataList.length
    ? imageDataList
    : imageData
      ? [imageData]
      : []

  const genAI = new GoogleGenerativeAI(API_KEY)

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  }

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ]

  let lastError = null

  const messageParts = []

  if (prompt) {
    messageParts.push({ text: prompt })
  }

  normalizedImageDataList.forEach((item) => {
    if (item?.base64 && item?.mimeType) {
      messageParts.push({
        inlineData: {
          data: item.base64,
          mimeType: item.mimeType,
        },
      })
    }
  })

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [],
      })

      const result = await chat.sendMessage(messageParts)
      const response = result.response
      const text = response.text()
      console.log(`Gemini response (${modelName}):`, text)
      return text
    } catch (error) {
      lastError = error

      const message = String(error?.message || '')
      const isModelNotFound = message.includes('is not found') || message.includes('[404')

      if (!isModelNotFound) {
        throw error
      }
    }
  }

  throw lastError || new Error('No available Gemini model was found for this API key')
}

export default runChat

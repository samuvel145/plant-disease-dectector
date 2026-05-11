import { useState, useRef, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { analyseImage, resetSession } from '../api/agentApi'
import { validateImageFile, createImagePreview, revokeImagePreview } from '../utils/imageUtils'

const SESSION_KEY = 'plantmd_session_id'

function createSessionId() {
  const id = uuidv4()
  sessionStorage.setItem(SESSION_KEY, id)
  return id
}

function getOrCreateSessionId() {
  return sessionStorage.getItem(SESSION_KEY) || createSessionId()
}

export function useChat() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const sessionId = useRef(getOrCreateSessionId())
  const galleryInputRef = useRef(null)
  const resultEndRef = useRef(null)

  useEffect(() => {
    resultEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [result, isLoading])

  useEffect(() => {
    if (!error) return
    const timeout = setTimeout(() => setError(null), 4500)
    return () => clearTimeout(timeout)
  }, [error])

  useEffect(() => {
    return () => {
      if (selectedImage?.previewUrl) revokeImagePreview(selectedImage.previewUrl)
    }
  }, [selectedImage])

  const startFreshSession = useCallback(async () => {
    try {
      await resetSession(sessionId.current)
    } catch {
      // A missing server-side session is fine; the next upload creates one.
    }
    sessionId.current = createSessionId()
  }, [])

  const analyseSelectedFile = useCallback(async (file, source) => {
    if (!file || isLoading) return

    const { valid, error: validationError } = validateImageFile(file)
    if (!valid) {
      setError(validationError)
      return
    }

    const previewUrl = createImagePreview(file)
    setSelectedImage((prev) => {
      if (prev?.previewUrl) revokeImagePreview(prev.previewUrl)
      return { file, previewUrl, source }
    })
    setResult(null)
    setError(null)
    setIsLoading(true)

    try {
      await startFreshSession()
      const data = await analyseImage(file, sessionId.current, null)

      if (data.type === 'diagnosis') {
        setResult({ type: 'diagnosis', data: data.data })
      } else if (data.type === 'guardrail') {
        setResult({ type: 'guardrail', message: data.message })
      }
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Something went wrong. Please try again.'
      setError(detail)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, startFreshSession])

  const handleGalleryInputChange = useCallback((event) => {
    const file = event.target.files?.[0]
    if (file) analyseSelectedFile(file, 'photos')
    event.target.value = ''
  }, [analyseSelectedFile])

  const handleReset = useCallback(async () => {
    await startFreshSession()
    setSelectedImage((prev) => {
      if (prev?.previewUrl) revokeImagePreview(prev.previewUrl)
      return null
    })
    setResult(null)
    setError(null)
    setIsLoading(false)
  }, [startFreshSession])

  const triggerGallery = useCallback(() => {
    galleryInputRef.current?.click()
  }, [])

  return {
    selectedImage,
    result,
    isLoading,
    error,
    galleryInputRef,
    resultEndRef,
    handleGalleryInputChange,
    analyseSelectedFile,
    handleReset,
    triggerGallery,
  }
}

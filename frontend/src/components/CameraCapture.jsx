import { useCallback, useEffect, useRef, useState } from 'react'

export default function CameraCapture({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(false)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const closeCamera = useCallback(() => {
    stopCamera()
    setError('')
    onClose()
  }, [onClose, stopCamera])

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      return
    }

    let cancelled = false

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera is not supported in this browser. Use Photos instead.')
        return
      }

      setIsStarting(true)
      setError('')

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch {
        setError('Camera permission was blocked or no camera was found.')
      } finally {
        if (!cancelled) setIsStarting(false)
      }
    }

    startCamera()

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [isOpen, stopCamera])

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera is not ready yet. Please try again.')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Could not capture the photo. Please try again.')
        return
      }

      const file = new File([blob], `plant-camera-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      })

      stopCamera()
      onClose()
      onCapture(file, 'camera')
    }, 'image/jpeg', 0.92)
  }, [onCapture, onClose, stopCamera])

  if (!isOpen) return null

  return (
    <div className="camera-overlay" role="dialog" aria-modal="true" aria-label="Camera capture">
      <div className="camera-panel">
        <div className="camera-header">
          <h2>Take Plant Photo</h2>
          <button type="button" className="camera-close-btn" onClick={closeCamera}>
            Close
          </button>
        </div>

        <div className="camera-view">
          {isStarting && <div className="camera-status">Starting camera...</div>}
          {error && <div className="camera-status camera-status--error">{error}</div>}
          <video ref={videoRef} playsInline muted autoPlay />
        </div>

        <div className="camera-actions">
          <button type="button" className="camera-secondary-btn" onClick={closeCamera}>
            Cancel
          </button>
          <button
            type="button"
            className="camera-capture-btn"
            onClick={capturePhoto}
            disabled={isStarting || !!error}
          >
            Capture
          </button>
        </div>
      </div>
    </div>
  )
}

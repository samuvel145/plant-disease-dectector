import { useState } from 'react'
import ChatWindow from './components/ChatWindow'
import CameraCapture from './components/CameraCapture'
import { useChat } from './hooks/useChat'

export default function App() {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const {
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
  } = useChat()

  return (
    <div className="app-shell">
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden-file-input"
        onChange={handleGalleryInputChange}
        aria-label="Choose plant photo from photos"
      />

      <ChatWindow
        selectedImage={selectedImage}
        result={result}
        isLoading={isLoading}
        resultEndRef={resultEndRef}
        onCamera={() => setIsCameraOpen(true)}
        onPhotos={triggerGallery}
        onReset={handleReset}
      />

      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={analyseSelectedFile}
      />

      {error && (
        <div className="error-toast" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
    </div>
  )
}

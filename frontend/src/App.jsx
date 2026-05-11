import ChatWindow from './components/ChatWindow'
import { useChat } from './hooks/useChat'

export default function App() {
  const {
    selectedImage,
    result,
    isLoading,
    error,
    cameraInputRef,
    galleryInputRef,
    resultEndRef,
    handleCameraInputChange,
    handleGalleryInputChange,
    handleReset,
    triggerCamera,
    triggerGallery,
  } = useChat()

  return (
    <div className="app-shell">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden-file-input"
        onChange={handleCameraInputChange}
        aria-label="Take a plant photo with camera"
      />
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
        onCamera={triggerCamera}
        onPhotos={triggerGallery}
        onReset={handleReset}
      />

      {error && (
        <div className="error-toast" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
    </div>
  )
}

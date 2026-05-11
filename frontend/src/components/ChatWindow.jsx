import ActionButtons from './ActionButtons'
import DiagnosisCard from './DiagnosisCard'
import TypingIndicator from './TypingIndicator'

export default function ChatWindow({
  selectedImage,
  result,
  isLoading,
  resultEndRef,
  onCamera,
  onPhotos,
  onReset,
}) {
  return (
    <main className="scan-screen" aria-live="polite">
      <section className="scan-hero" aria-label="Plant analyser">
        <div className="brand-mark">Plant Analyser</div>
        <h1>Grow smarter. Catch plant problems early.</h1>
        <p>
          Take a fresh leaf photo or choose one from your photos to get a quick
          plant health diagnosis.
        </p>
        <ActionButtons onCamera={onCamera} onPhotos={onPhotos} disabled={isLoading} />
      </section>

      {(selectedImage || isLoading || result) && (
        <section className="scan-results" aria-label="Analysis result">
          {selectedImage && (
            <div className="selected-image-panel">
              <img src={selectedImage.previewUrl} alt="Selected plant" />
              <div>
                <span>{selectedImage.source === 'camera' ? 'Camera photo' : 'Photo selected'}</span>
                <strong>{selectedImage.file.name}</strong>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="analysis-loading" role="status">
              <TypingIndicator />
              <span>Analysing your plant image...</span>
            </div>
          )}

          {result?.type === 'diagnosis' && (
            <DiagnosisCard data={result.data} onCamera={onCamera} onPhotos={onPhotos} />
          )}

          {result?.type === 'guardrail' && (
            <div className="guardrail-card">
              <p>{result.message}</p>
              <ActionButtons onCamera={onCamera} onPhotos={onPhotos} />
            </div>
          )}

          {result && (
            <button className="quiet-reset-btn" type="button" onClick={onReset}>
              Clear result
            </button>
          )}

          <div ref={resultEndRef} />
        </section>
      )}
    </main>
  )
}

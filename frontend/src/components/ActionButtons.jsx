export default function ActionButtons({ onCamera, onPhotos, disabled = false }) {
  return (
    <div className="action-buttons" aria-label="Choose image source">
      <button
        className="action-btn action-btn--camera"
        type="button"
        onClick={onCamera}
        disabled={disabled}
      >
        <span className="action-icon">CAM</span>
        Camera
      </button>
      <button
        className="action-btn action-btn--photos"
        type="button"
        onClick={onPhotos}
        disabled={disabled}
      >
        <span className="action-icon">IMG</span>
        Photos
      </button>
    </div>
  )
}

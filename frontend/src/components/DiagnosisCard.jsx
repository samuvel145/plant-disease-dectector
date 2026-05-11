import { useEffect, useRef } from 'react'
import ActionButtons from './ActionButtons'

const COLOUR_MAP = {
  green: { bar: 'conf-cool', badge: 'badge-cool' },
  'light-green': { bar: 'conf-cool-light', badge: 'badge-cool-light' },
  amber: { bar: 'conf-amber', badge: 'badge-amber' },
  orange: { bar: 'conf-orange', badge: 'badge-orange' },
  red: { bar: 'conf-red', badge: 'badge-red' },
}

function parseConfidenceInt(str) {
  const match = str?.match(/\d+/)
  return match ? Math.min(100, parseInt(match[0], 10)) : 0
}

function getColour(pct) {
  if (pct >= 90) return 'green'
  if (pct >= 75) return 'light-green'
  if (pct >= 55) return 'amber'
  if (pct >= 35) return 'orange'
  return 'red'
}

function getTierLabel(pct) {
  if (pct >= 90) return 'Very High'
  if (pct >= 75) return 'High'
  if (pct >= 55) return 'Moderate'
  if (pct >= 35) return 'Low'
  return 'Very Low'
}

export default function DiagnosisCard({ data, onCamera, onPhotos }) {
  const confInt = parseConfidenceInt(data.confidence)
  const colour = data.confidence_colour || getColour(confInt)
  const tier = data.confidence_tier || getTierLabel(confInt)
  const colours = COLOUR_MAP[colour] || COLOUR_MAP.green
  const barRef = useRef(null)

  useEffect(() => {
    if (!barRef.current) return
    barRef.current.style.width = '0%'
    const timeout = setTimeout(() => {
      if (barRef.current) barRef.current.style.width = `${confInt}%`
    }, 80)
    return () => clearTimeout(timeout)
  }, [confInt])

  const diseaseText = data.disease || ''
  const isHealthy =
    diseaseText.toLowerCase().includes('none detected') ||
    diseaseText.toLowerCase().includes('healthy')

  return (
    <div className="diagnosis-card" role="region" aria-label="Diagnosis result">
      <div className="diagnosis-header">
        <span className="diagnosis-badge">
          {isHealthy ? 'Healthy Plant' : 'Diagnosis Complete'}
        </span>
      </div>

      <div className="diagnosis-row">
        <span className="diagnosis-label">Plant</span>
        <span className="diagnosis-value">{data.plant}</span>
      </div>

      <div className="diagnosis-row">
        <span className="diagnosis-label">Disease</span>
        <span className="diagnosis-value" style={{ color: isHealthy ? '#b7e6ff' : '#fffaf0' }}>
          {data.disease}
        </span>
      </div>

      <div className="diagnosis-row diagnosis-row--stacked">
        <div className="confidence-line">
          <span className="diagnosis-label">Confidence</span>
          <span className="diagnosis-value">
            {data.confidence}
            <span className={`conf-tier-badge ${colours.badge}`}>{tier}</span>
          </span>
        </div>
        <div className="confidence-bar-wrap">
          <div
            ref={barRef}
            className={`confidence-bar-fill ${colours.bar}`}
            style={{ width: '0%', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
            role="progressbar"
            aria-valuenow={confInt}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {data.symptoms?.length > 0 && (
        <>
          <p className="diagnosis-section-title">Symptoms</p>
          <ul className="diagnosis-list">
            {data.symptoms.map((symptom, index) => (
              <li key={index}>{symptom}</li>
            ))}
          </ul>
        </>
      )}

      {data.treatment?.length > 0 && (
        <>
          <p className="diagnosis-section-title">Treatment</p>
          <ol className="diagnosis-list">
            {data.treatment.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </>
      )}

      {confInt < 35 && (
        <div className="disclaimer-box" role="alert">
          This result has low confidence. Please consult a local agricultural
          extension officer for confirmation.
        </div>
      )}

      <ActionButtons onCamera={onCamera} onPhotos={onPhotos} />
    </div>
  )
}

import { useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { CameraView } from '../components/CameraView'
import { OverlayCanvas } from '../components/OverlayCanvas'
import OpacitySlider from '../components/OpacitySlider'
import ShutterButton from '../components/ShutterButton'
import { downloadBlob } from '../utils/download'

interface CameraScreenProps {
  onBack: () => void
}

export function CameraScreen({ onBack }: CameraScreenProps) {
  const { referenceImageUrl, markers, showMarkers, referenceImageAspectRatio } = useAppContext()

  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [overlayOpacity, setOverlayOpacity] = useState(0.5)
  const [showGrid, setShowGrid] = useState(false)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [triggerCapture, setTriggerCapture] = useState(false)

  const handleStreamReady = (stream: MediaStream, videoEl: HTMLVideoElement) => {
    streamRef.current = stream
    videoRef.current = videoEl
  }

  const handleBack = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onBack()
  }

  const handleShutter = () => {
    setTriggerCapture(true)
  }

  const handleCapture = (blob: Blob) => {
    setCapturedBlob(blob)
    downloadBlob(blob, 'photo.jpg')
    setTriggerCapture(false)
  }

  return (
    <div
      className="camera-screen"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: '#000',
        color: '#fff',
      }}
    >
      {/* Header */}
      <div className="camera-header" style={{ padding: '8px 12px', flexShrink: 0 }}>
        <button
          onClick={handleBack}
          aria-label="戻る"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            cursor: 'pointer',
            minHeight: 44,
            minWidth: 44,
          }}
        >
          ← 戻る
        </button>
      </div>

      {/* Camera area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: referenceImageAspectRatio ? `${referenceImageAspectRatio}` : '4/3',
            maxHeight: '100%',
            maxWidth: referenceImageAspectRatio
              ? `calc(100dvh * ${referenceImageAspectRatio})`
              : undefined,
            overflow: 'hidden',
          }}
        >
          <CameraView onStreamReady={handleStreamReady} onError={setCameraError} />
          <OverlayCanvas
            videoEl={videoRef.current}
            referenceImageUrl={referenceImageUrl}
            markers={markers}
            showMarkers={showMarkers}
            opacity={overlayOpacity}
            showGrid={showGrid}
            onCapture={handleCapture}
            triggerCapture={triggerCapture}
          />
        </div>
      </div>

      {/* Error message */}
      {cameraError && (
        <div
          style={{
            padding: '8px 16px',
            background: 'rgba(200,0,0,0.8)',
            color: '#fff',
            fontSize: 14,
            textAlign: 'center',
          }}
        >
          {cameraError}
        </div>
      )}

      {/* Controls */}
      <div className="camera-controls" style={{ padding: '8px 16px', flexShrink: 0, background: 'rgba(0,0,0,0.7)' }}>
        <OpacitySlider value={overlayOpacity} onChange={setOverlayOpacity} />
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => setShowGrid((v) => !v)}
            aria-pressed={showGrid}
            style={{
              background: showGrid ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 14,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            グリッド {showGrid ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Shutter */}
      <div
        className="camera-shutter"
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px',
          flexShrink: 0,
          background: 'rgba(0,0,0,0.7)',
        }}
      >
        <ShutterButton onShutter={handleShutter} disabled={!!cameraError} />
      </div>

      {/* Captured indicator (optional feedback) */}
      {capturedBlob && (
        <div style={{ display: 'none' }} />
      )}
    </div>
  )
}

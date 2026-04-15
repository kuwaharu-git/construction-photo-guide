import { useRef } from 'react'
import type { Marker } from '../types'
import { normalizeCoordinate } from '../utils/coordinates'
import { MarkerDot } from './MarkerDot'

interface MarkerCanvasProps {
  imageUrl: string | null
  markers: Marker[]
  showMarkers: boolean
  onAddMarker: (x: number, y: number) => void
  onRemoveMarker: (id: string) => void
}

export function MarkerCanvas({
  imageUrl,
  markers,
  showMarkers,
  onAddMarker,
  onRemoveMarker,
}: MarkerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageUrl) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pixelX = e.clientX - rect.left
    const pixelY = e.clientY - rect.top
    const { x, y } = normalizeCoordinate(pixelX, pixelY, rect.width, rect.height)
    onAddMarker(x, y)
  }

  if (!imageUrl) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: 240,
          background: '#f3f4f6',
          borderRadius: 8,
          color: '#9ca3af',
          fontSize: 14,
        }}
      >
        画像が選択されていません
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ position: 'relative', width: '100%', cursor: 'crosshair' }}
    >
      <img src={imageUrl} alt="参照画像" style={{ width: '100%', display: 'block' }} />
      {showMarkers &&
        markers.map((marker) => (
          <MarkerDot
            key={marker.id}
            marker={marker}
            onRemove={onRemoveMarker}
          />
        ))}
    </div>
  )
}

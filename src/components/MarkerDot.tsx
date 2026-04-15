import type { Marker } from '../types'

interface MarkerDotProps {
  marker: Marker
  onRemove: (id: string) => void
}

export function MarkerDot({ marker, onRemove }: MarkerDotProps) {
  const left = `${marker.x * 100}%`
  const top = `${marker.y * 100}%`

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onRemove(marker.id) }}
      aria-label="マーカーを削除"
      style={{
        position: 'absolute',
        left,
        top,
        transform: 'translate(-50%, -50%)',
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          border: '2px solid #fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          display: 'block',
        }}
      />
    </button>
  )
}

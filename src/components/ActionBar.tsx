interface ActionBarProps {
  hasImage: boolean
  showMarkers: boolean
  onToggleMarkers: () => void
  onStartCamera: () => void
}

export function ActionBar({ hasImage, showMarkers, onToggleMarkers, onStartCamera }: ActionBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
        gap: 12,
      }}
    >
      <button
        onClick={onToggleMarkers}
        aria-pressed={showMarkers}
        style={{
          minWidth: 44,
          minHeight: 44,
          padding: '0 16px',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          background: showMarkers ? '#3b82f6' : '#f9fafb',
          color: showMarkers ? '#fff' : '#374151',
          cursor: 'pointer',
          fontSize: 14,
        }}
      >
        目印 {showMarkers ? 'ON' : 'OFF'}
      </button>

      <button
        onClick={onStartCamera}
        disabled={!hasImage}
        style={{
          minWidth: 44,
          minHeight: 44,
          padding: '0 24px',
          border: 'none',
          borderRadius: 8,
          background: hasImage ? '#3b82f6' : '#d1d5db',
          color: '#fff',
          cursor: hasImage ? 'pointer' : 'not-allowed',
          fontSize: 14,
          fontWeight: 600,
          flex: 1,
        }}
      >
        撮影開始
      </button>
    </div>
  )
}

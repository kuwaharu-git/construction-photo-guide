import { useAppContext } from '../context/AppContext'
import { ImageUploader } from '../components/ImageUploader'
import { MarkerCanvas } from '../components/MarkerCanvas'
import { ActionBar } from '../components/ActionBar'

interface HomeScreenProps {
  onStartCamera: () => void
}

export function HomeScreen({ onStartCamera }: HomeScreenProps) {
  const {
    referenceImageUrl,
    markers,
    showMarkers,
    setReferenceImage,
    addMarker,
    removeMarker,
    toggleShowMarkers,
  } = useAppContext()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <ImageUploader onImageSelected={setReferenceImage} />

        <MarkerCanvas
          imageUrl={referenceImageUrl}
          markers={markers}
          showMarkers={showMarkers}
          onAddMarker={addMarker}
          onRemoveMarker={removeMarker}
        />
      </div>

      <div style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
        <ActionBar
          hasImage={referenceImageUrl !== null}
          showMarkers={showMarkers}
          onToggleMarkers={toggleShowMarkers}
          onStartCamera={onStartCamera}
        />
      </div>
    </div>
  )
}

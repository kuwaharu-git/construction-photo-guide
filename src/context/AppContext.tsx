import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AppContextValue, Marker } from '../types'

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [referenceImage, setReferenceImageState] = useState<File | null>(null)
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null)
  const [markers, setMarkers] = useState<Marker[]>([])
  const [showMarkers, setShowMarkers] = useState(true)

  const setReferenceImage = (file: File, url: string) => {
    setReferenceImageState(file)
    setReferenceImageUrl(url)
  }

  const addMarker = (x: number, y: number) => {
    const marker: Marker = { id: crypto.randomUUID(), x, y }
    setMarkers((prev) => [...prev, marker])
  }

  const removeMarker = (id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id))
  }

  const toggleShowMarkers = () => {
    setShowMarkers((prev) => !prev)
  }

  return (
    <AppContext.Provider
      value={{
        referenceImage,
        referenceImageUrl,
        setReferenceImage,
        markers,
        addMarker,
        removeMarker,
        showMarkers,
        toggleShowMarkers,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}

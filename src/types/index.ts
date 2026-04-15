export type Marker = {
  id: string;   // crypto.randomUUID() で生成
  x: number;    // 参照画像幅に対する相対X座標（0.0〜1.0）
  y: number;    // 参照画像高さに対する相対Y座標（0.0〜1.0）
}

export type AppContextValue = {
  // 参照画像
  referenceImage: File | null
  referenceImageUrl: string | null
  setReferenceImage: (file: File, url: string) => void

  // 目印
  markers: Marker[]
  addMarker: (x: number, y: number) => void
  removeMarker: (id: string) => void

  // 表示設定
  showMarkers: boolean
  toggleShowMarkers: () => void
}

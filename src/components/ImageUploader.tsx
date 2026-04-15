import { useRef, useState } from 'react'
import heic2any from 'heic2any'

interface ImageUploaderProps {
  onImageSelected: (file: File, url: string) => void
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const MAX_DIMENSION = 2048

function isHeic(file: File): boolean {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  const name = file.name.toLowerCase()
  return name.endsWith('.heic') || name.endsWith('.heif')
}

async function resizeImage(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { width, height } = img
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        resolve(blob)
        return
      }
      const scale = MAX_DIMENSION / Math.max(width, height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas context unavailable')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((result) => {
        if (result) resolve(result)
        else reject(new Error('Canvas toBlob failed'))
      }, 'image/jpeg', 0.9)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
    img.src = url
  })
}

export function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const prevUrlRef = useRef<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      let blob: Blob = file

      // HEIC → JPEG 変換
      if (isHeic(file)) {
        const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
        blob = Array.isArray(converted) ? converted[0] : converted
      }

      // 10MB超の場合はリサイズ
      if (blob.size > MAX_SIZE_BYTES) {
        blob = await resizeImage(blob)
      }

      // 前のObjectURLを解放
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current)
      }

      const url = URL.createObjectURL(blob)
      prevUrlRef.current = url

      // File オブジェクトを再構築（変換後のblobから）
      const outputFile = blob instanceof File ? blob : new File([blob], file.name, { type: blob.type || 'image/jpeg' })
      onImageSelected(outputFile, url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像の読み込みに失敗しました')
    } finally {
      setIsLoading(false)
      // 同じファイルを再選択できるようにリセット
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-label="画像ファイルを選択"
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        style={{ minWidth: 44, minHeight: 44 }}
        aria-busy={isLoading}
      >
        {isLoading ? '読み込み中...' : '写真を選択'}
      </button>
      {error && <p role="alert" style={{ color: 'red', marginTop: 8 }}>{error}</p>}
    </div>
  )
}

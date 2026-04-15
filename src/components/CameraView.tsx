import { useEffect, useRef, useState } from 'react'

interface CameraViewProps {
  onStreamReady: (stream: MediaStream, videoEl: HTMLVideoElement) => void
  onError: (message: string) => void
}

export function CameraView({ onStreamReady, onError }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setIsLoading(false)
        onError('このブラウザはカメラに対応していません')
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })

        const videoEl = videoRef.current
        if (!videoEl) return

        videoEl.srcObject = stream
        await videoEl.play()
        setIsLoading(false)
        onStreamReady(stream, videoEl)
      } catch (err) {
        setIsLoading(false)
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          onError('カメラへのアクセスが拒否されました。設定から許可してください')
        } else {
          onError('カメラの起動に失敗しました')
        }
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            color: '#fff',
            zIndex: 1,
          }}
        >
          カメラ起動中...
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  )
}

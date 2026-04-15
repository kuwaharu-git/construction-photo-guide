import { useEffect, useRef } from 'react'
import type { Marker } from '../types'

interface OverlayCanvasProps {
  videoEl: HTMLVideoElement | null
  referenceImageUrl: string | null
  markers: Marker[]
  showMarkers: boolean
  opacity: number // 0.0 to 1.0
  showGrid: boolean
  onCapture: (blob: Blob) => void
  triggerCapture?: boolean
}

export function OverlayCanvas({
  videoEl,
  referenceImageUrl,
  markers,
  showMarkers,
  opacity,
  showGrid,
  onCapture,
  triggerCapture,
}: OverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafIdRef = useRef<number>(0)
  const refImageRef = useRef<HTMLImageElement | null>(null)
  const triggerCaptureRef = useRef(triggerCapture)

  // Keep triggerCapture ref in sync
  useEffect(() => {
    triggerCaptureRef.current = triggerCapture
  }, [triggerCapture])

  // Load reference image when URL changes
  useEffect(() => {
    if (!referenceImageUrl) {
      refImageRef.current = null
      return
    }
    const img = new Image()
    img.onload = () => {
      refImageRef.current = img
    }
    img.src = referenceImageUrl
  }, [referenceImageUrl])

  // Handle capture trigger
  useEffect(() => {
    if (!triggerCapture) return
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob)
      },
      'image/jpeg',
      0.95,
    )
  }, [triggerCapture, onCapture])

  // rAF draw loop + ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Sync canvas size to video element
    const syncSize = () => {
      if (videoEl) {
        canvas.width = videoEl.clientWidth
        canvas.height = videoEl.clientHeight
      }
    }

    let observer: ResizeObserver | null = null
    if (videoEl) {
      syncSize()
      observer = new ResizeObserver(syncSize)
      observer.observe(videoEl)
    }

    const draw = () => {
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)

      // 1. Draw camera video
      if (videoEl && videoEl.readyState >= 2) {
        ctx.drawImage(videoEl, 0, 0, w, h)
      }

      // 2. Draw reference image with opacity
      const refImage = refImageRef.current
      if (refImage) {
        ctx.globalAlpha = opacity
        ctx.drawImage(refImage, 0, 0, w, h)
        ctx.globalAlpha = 1.0
      }

      // 3. Draw markers
      if (showMarkers) {
        for (const marker of markers) {
          const px = marker.x * w
          const py = marker.y * h
          const radius = 10

          ctx.beginPath()
          ctx.arc(px, py, radius, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 80, 80, 0.8)'
          ctx.fill()
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      // 4. Draw grid (rule of thirds)
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 1

        // 2 vertical lines
        for (let i = 1; i <= 2; i++) {
          const x = (w / 3) * i
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h)
          ctx.stroke()
        }

        // 2 horizontal lines
        for (let i = 1; i <= 2; i++) {
          const y = (h / 3) * i
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(w, y)
          ctx.stroke()
        }
      }

      rafIdRef.current = requestAnimationFrame(draw)
    }

    rafIdRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafIdRef.current)
      observer?.disconnect()
    }
  }, [videoEl, opacity, showMarkers, markers, showGrid])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { CameraView } from './CameraView'

describe('CameraView', () => {
  const onStreamReady = vi.fn()
  const onError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('getUserMedia 非対応時に onError が呼ばれること (F-06, 8-2)', async () => {
    // navigator.mediaDevices を undefined にして非対応ブラウザをシミュレート
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      configurable: true,
    })

    render(<CameraView onStreamReady={onStreamReady} onError={onError} />)

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('このブラウザはカメラに対応していません')
    })
    expect(onStreamReady).not.toHaveBeenCalled()
  })

  it('カメラ権限拒否時に onError が適切なメッセージで呼ばれること', async () => {
    const notAllowedError = new DOMException('Permission denied', 'NotAllowedError')
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockRejectedValue(notAllowedError),
      },
      configurable: true,
    })

    render(<CameraView onStreamReady={onStreamReady} onError={onError} />)

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        'カメラへのアクセスが拒否されました。設定から許可してください'
      )
    })
    expect(onStreamReady).not.toHaveBeenCalled()
  })

  it('アンマウント時にストリームが停止されること (F-06)', async () => {
    const mockStop = vi.fn()
    const mockTrack = { stop: mockStop }
    const mockStream = {
      getTracks: vi.fn().mockReturnValue([mockTrack]),
    } as unknown as MediaStream

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      configurable: true,
    })

    // videoRef.current をモックするため useRef をスパイ
    const { unmount } = render(<CameraView onStreamReady={onStreamReady} onError={onError} />)

    // ストリーム取得を待つ
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'environment' },
      })
    })

    unmount()

    // アンマウント後にトラックが停止されること
    await waitFor(() => {
      expect(mockStop).toHaveBeenCalled()
    })
  })

  it('カメラ起動中はローディング表示が出ること', () => {
    // getUserMedia が解決しない Promise を返す（ローディング中の状態を維持）
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockReturnValue(new Promise(() => {})),
      },
      configurable: true,
    })

    render(<CameraView onStreamReady={onStreamReady} onError={onError} />)

    expect(screen.getByText('カメラ起動中...')).toBeInTheDocument()
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import App from './App'

// Mock heic2any (uses Worker which is not available in jsdom)
vi.mock('heic2any', () => ({
  default: vi.fn(),
}))

// Mock ResizeObserver (not implemented in jsdom)
class ResizeObserverMock {
  callback: ResizeObserverCallback
  constructor(cb: ResizeObserverCallback) { this.callback = cb }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

// Mock URL methods
Object.defineProperty(URL, 'createObjectURL', { value: vi.fn(() => 'blob:mock-url'), writable: true })
Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), writable: true })

beforeEach(() => {
  vi.mocked(URL.createObjectURL).mockReturnValue('blob:mock-url')
  vi.mocked(URL.revokeObjectURL).mockImplementation(() => {})
})

afterEach(() => {
  vi.clearAllMocks()
})

/**
 * Helper: upload a reference image to HomeScreen so the "撮影開始" button becomes enabled.
 */
async function uploadReferenceImage() {
  const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' })
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files: [file] } })
  // Wait for the image to appear (URL.createObjectURL returns 'blob:mock-url')
  await waitFor(() => {
    expect(screen.getByAltText('参照画像')).toBeInTheDocument()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: Screen navigation — state preservation
// ─────────────────────────────────────────────────────────────────────────────
describe('画面遷移と状態保持', () => {
  it('SCR-01 → SCR-02 → SCR-01 の遷移で参照画像URLが保持される', async () => {
    // Mock getUserMedia so CameraView doesn't error
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    })

    render(<App />)

    // Upload a reference image
    await uploadReferenceImage()

    // Verify image preview is shown on HomeScreen
    expect(screen.getByAltText('参照画像')).toBeInTheDocument()

    // Click on MarkerCanvas to add a marker
    const markerCanvas = screen.getByAltText('参照画像').parentElement!
    fireEvent.click(markerCanvas, { clientX: 100, clientY: 100 })

    // Navigate to CameraScreen
    const startButton = screen.getByText('撮影開始')
    expect(startButton).not.toBeDisabled()
    fireEvent.click(startButton)

    // CameraScreen should be visible (back button present)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /戻る/ })).toBeInTheDocument()
    })

    // Go back to HomeScreen
    fireEvent.click(screen.getByRole('button', { name: /戻る/ }))

    // HomeScreen should be shown again
    await waitFor(() => {
      expect(screen.getByText('撮影開始')).toBeInTheDocument()
    })

    // Reference image should still be visible (state preserved)
    expect(screen.getByAltText('参照画像')).toBeInTheDocument()
    expect(screen.getByAltText('参照画像')).toHaveAttribute('src', 'blob:mock-url')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: Camera not supported — error message shown
// ─────────────────────────────────────────────────────────────────────────────
describe('カメラ非対応ブラウザ', () => {
  it('navigator.mediaDevices が undefined のときエラーメッセージが表示される', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    })

    render(<App />)

    // Need a reference image to enable the start button
    await uploadReferenceImage()

    fireEvent.click(screen.getByText('撮影開始'))

    await waitFor(() => {
      expect(
        screen.getByText('このブラウザはカメラに対応していません')
      ).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: Camera permission denied — error message shown
// ─────────────────────────────────────────────────────────────────────────────
describe('カメラ権限拒否', () => {
  it('getUserMedia が NotAllowedError で reject したときエラーメッセージが表示される', async () => {
    const notAllowedError = new DOMException('Permission denied', 'NotAllowedError')
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockRejectedValue(notAllowedError),
      },
    })

    render(<App />)

    await uploadReferenceImage()

    fireEvent.click(screen.getByText('撮影開始'))

    await waitFor(() => {
      expect(
        screen.getByText('カメラへのアクセスが拒否されました。設定から許可してください')
      ).toBeInTheDocument()
    })
  })
})

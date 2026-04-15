import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ImageUploader } from './ImageUploader'

// Mock heic2any
vi.mock('heic2any', () => ({
  default: vi.fn(),
}))

// Mock URL methods
const mockObjectURL = 'blob:http://localhost/mock-url'
const createObjectURLMock = vi.fn(() => mockObjectURL)
const revokeObjectURLMock = vi.fn()

Object.defineProperty(URL, 'createObjectURL', { value: createObjectURLMock, writable: true })
Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURLMock, writable: true })

function makeFile(name: string, type: string, size = 100): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('ImageUploader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createObjectURLMock.mockReturnValue(mockObjectURL)
  })

  it('通常の画像ファイルを選択すると URL.createObjectURL が呼ばれ onImageSelected が URL とともに呼ばれる', async () => {
    const onImageSelected = vi.fn()
    render(<ImageUploader onImageSelected={onImageSelected} />)

    const input = screen.getByLabelText('画像ファイルを選択')
    const file = makeFile('photo.jpg', 'image/jpeg')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(createObjectURLMock).toHaveBeenCalled()
      expect(onImageSelected).toHaveBeenCalledWith(expect.any(File), mockObjectURL)
    })
  })

  it('HEIC 変換が失敗するとエラーメッセージが表示される', async () => {
    const { default: heic2any } = await import('heic2any')
    ;(heic2any as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('HEIC conversion failed'))

    const onImageSelected = vi.fn()
    render(<ImageUploader onImageSelected={onImageSelected} />)

    const input = screen.getByLabelText('画像ファイルを選択')
    const file = makeFile('photo.heic', 'image/heic')

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('HEIC conversion failed')
    })

    expect(onImageSelected).not.toHaveBeenCalled()
  })
})

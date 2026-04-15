import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { downloadBlob } from './download'

describe('downloadBlob', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>
  let revokeObjectURLMock: ReturnType<typeof vi.fn>
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let removeChildSpy: ReturnType<typeof vi.spyOn>
  let clickSpy: ReturnType<typeof vi.fn>
  let capturedAnchor: HTMLAnchorElement | null

  beforeEach(() => {
    capturedAnchor = null
    createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/test-url')
    revokeObjectURLMock = vi.fn()
    URL.createObjectURL = createObjectURLMock as unknown as typeof URL.createObjectURL
    URL.revokeObjectURL = revokeObjectURLMock as unknown as typeof URL.revokeObjectURL

    clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        el.click = clickSpy as unknown as () => void
        capturedAnchor = el as HTMLAnchorElement
      }
      return el
    })

    appendChildSpy = vi.spyOn(document.body, 'appendChild')
    removeChildSpy = vi.spyOn(document.body, 'removeChild')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('URL.createObjectURL を Blob で呼び出す', () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' })
    downloadBlob(blob, 'photo.jpg')
    expect(createObjectURLMock).toHaveBeenCalledWith(blob)
  })

  it('<a> 要素に正しい href と download 属性を設定する', () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' })
    downloadBlob(blob, 'photo.jpg')
    expect(capturedAnchor).not.toBeNull()
    expect((capturedAnchor as HTMLAnchorElement).href).toContain('blob:http://localhost/test-url')
    expect((capturedAnchor as HTMLAnchorElement).download).toBe('photo.jpg')
  })

  it('<a> 要素の click() を呼び出す', () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' })
    downloadBlob(blob, 'photo.jpg')
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('<a> 要素を document.body に追加してから削除する', () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' })
    downloadBlob(blob, 'photo.jpg')
    expect(appendChildSpy).toHaveBeenCalledTimes(1)
    expect(removeChildSpy).toHaveBeenCalledTimes(1)
  })

  it('URL.revokeObjectURL を呼び出してメモリを解放する', () => {
    const blob = new Blob(['test'], { type: 'image/jpeg' })
    downloadBlob(blob, 'photo.jpg')
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:http://localhost/test-url')
  })

  it('指定したファイル名が download 属性に設定される', () => {
    const blob = new Blob(['data'], { type: 'image/png' })
    downloadBlob(blob, 'construction-2024.png')
    expect((capturedAnchor as HTMLAnchorElement).download).toBe('construction-2024.png')
  })
})

import { render, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest'
import { MarkerCanvas } from './MarkerCanvas'

// jsdom does not implement ResizeObserver — use a class-based mock
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

afterAll(() => {
  vi.unstubAllGlobals()
})

const IMAGE_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('MarkerCanvas', () => {
  it('クリック座標が相対座標に正しく変換されて onAddMarker が呼ばれる（中央クリック → 0.5, 0.5）', () => {
    const onAddMarker = vi.fn()

    const { container } = render(
      <MarkerCanvas
        imageUrl={IMAGE_URL}
        markers={[]}
        showMarkers={true}
        onAddMarker={onAddMarker}
        onRemoveMarker={vi.fn()}
      />
    )

    const div = container.firstChild as HTMLElement

    // Mock getBoundingClientRect to return a 400×300 container at origin
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 400,
      height: 300,
      right: 400,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect)

    // Click at pixel (200, 150) → relative (0.5, 0.5)
    fireEvent.click(div, { clientX: 200, clientY: 150 })

    expect(onAddMarker).toHaveBeenCalledOnce()
    expect(onAddMarker).toHaveBeenCalledWith(0.5, 0.5)
  })

  it('クリック座標が相対座標に正しく変換されて onAddMarker が呼ばれる（左上クリック → 0.25, 0.25）', () => {
    const onAddMarker = vi.fn()

    const { container } = render(
      <MarkerCanvas
        imageUrl={IMAGE_URL}
        markers={[]}
        showMarkers={true}
        onAddMarker={onAddMarker}
        onRemoveMarker={vi.fn()}
      />
    )

    const div = container.firstChild as HTMLElement

    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 400,
      height: 300,
      right: 400,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect)

    // Click at pixel (100, 75) → relative (0.25, 0.25)
    fireEvent.click(div, { clientX: 100, clientY: 75 })

    expect(onAddMarker).toHaveBeenCalledOnce()
    expect(onAddMarker).toHaveBeenCalledWith(0.25, 0.25)
  })

  it('コンテナがオフセットされている場合でも相対座標が正しく計算される', () => {
    const onAddMarker = vi.fn()

    const { container } = render(
      <MarkerCanvas
        imageUrl={IMAGE_URL}
        markers={[]}
        showMarkers={true}
        onAddMarker={onAddMarker}
        onRemoveMarker={vi.fn()}
      />
    )

    const div = container.firstChild as HTMLElement

    // Container starts at (50, 100) in the viewport
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      top: 100,
      width: 400,
      height: 300,
      right: 450,
      bottom: 400,
      x: 50,
      y: 100,
      toJSON: () => {},
    } as DOMRect)

    // clientX=250, clientY=250 → pixelX=200, pixelY=150 → relative (0.5, 0.5)
    fireEvent.click(div, { clientX: 250, clientY: 250 })

    expect(onAddMarker).toHaveBeenCalledOnce()
    expect(onAddMarker).toHaveBeenCalledWith(0.5, 0.5)
  })

  it('imageUrl が null のとき onAddMarker は呼ばれない', () => {
    const onAddMarker = vi.fn()

    const { getByText } = render(
      <MarkerCanvas
        imageUrl={null}
        markers={[]}
        showMarkers={true}
        onAddMarker={onAddMarker}
        onRemoveMarker={vi.fn()}
      />
    )

    fireEvent.click(getByText('画像が選択されていません'))

    expect(onAddMarker).not.toHaveBeenCalled()
  })
})

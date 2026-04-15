import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { normalizeCoordinate, toPixelCoordinate } from './coordinates'

describe('normalizeCoordinate', () => {
  it('中央クリックで (0.5, 0.5) を返す', () => {
    const result = normalizeCoordinate(100, 100, 200, 200)
    expect(result).toEqual({ x: 0.5, y: 0.5 })
  })

  it('左上隅で (0, 0) を返す', () => {
    const result = normalizeCoordinate(0, 0, 400, 300)
    expect(result).toEqual({ x: 0, y: 0 })
  })

  it('右下隅で (1, 1) を返す', () => {
    const result = normalizeCoordinate(400, 300, 400, 300)
    expect(result).toEqual({ x: 1, y: 1 })
  })

  it('コンテナ外の座標は 0〜1 にクランプされる', () => {
    const result = normalizeCoordinate(-10, 500, 400, 300)
    expect(result.x).toBe(0)
    expect(result.y).toBe(1)
  })

  it('異なる幅・高さで正しく正規化する', () => {
    const result = normalizeCoordinate(80, 60, 400, 300)
    expect(result).toEqual({ x: 0.2, y: 0.2 })
  })
})

describe('toPixelCoordinate', () => {
  it('相対座標 (0.5, 0.5) をコンテナ中央のピクセル座標に変換する', () => {
    const result = toPixelCoordinate(0.5, 0.5, 200, 200)
    expect(result).toEqual({ x: 100, y: 100 })
  })

  it('相対座標 (0, 0) を (0, 0) に変換する', () => {
    const result = toPixelCoordinate(0, 0, 400, 300)
    expect(result).toEqual({ x: 0, y: 0 })
  })

  it('相対座標 (1, 1) をコンテナ右下に変換する', () => {
    const result = toPixelCoordinate(1, 1, 400, 300)
    expect(result).toEqual({ x: 400, y: 300 })
  })

  it('異なる幅・高さで正しく変換する', () => {
    const result = toPixelCoordinate(0.25, 0.75, 800, 600)
    expect(result).toEqual({ x: 200, y: 450 })
  })
})

describe('ラウンドトリップ', () => {
  it('ピクセル → 相対 → ピクセルで元の値に戻る', () => {
    const px = 120
    const py = 90
    const w = 400
    const h = 300
    const rel = normalizeCoordinate(px, py, w, h)
    const back = toPixelCoordinate(rel.x, rel.y, w, h)
    expect(back.x).toBeCloseTo(px)
    expect(back.y).toBeCloseTo(py)
  })

  it('相対 → ピクセル → 相対で元の値に戻る', () => {
    const rx = 0.3
    const ry = 0.7
    const w = 500
    const h = 400
    const px = toPixelCoordinate(rx, ry, w, h)
    const back = normalizeCoordinate(px.x, px.y, w, h)
    expect(back.x).toBeCloseTo(rx)
    expect(back.y).toBeCloseTo(ry)
  })
})

/**
 * Property 2: 目印座標のラウンドトリップ
 * **Validates: Requirements 8-3.2**
 *
 * 任意の相対座標（rx, ry）と任意の表示サイズ（width, height）に対して、
 * 相対座標をピクセル座標に変換し、再度相対座標に変換した結果は元の相対座標と等しい。
 */
describe('Property 2: 目印座標のラウンドトリップ (Validates: Requirements 8-3.2)', () => {
  it('任意の相対座標と表示サイズに対して 相対→ピクセル→相対 のラウンドトリップが元の値を保持する', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1, noNaN: true }),        // rx
        fc.float({ min: 0, max: 1, noNaN: true }),        // ry
        fc.integer({ min: 1, max: 10000 }),               // containerWidth
        fc.integer({ min: 1, max: 10000 }),               // containerHeight
        (rx, ry, containerWidth, containerHeight) => {
          const pixel = toPixelCoordinate(rx, ry, containerWidth, containerHeight)
          const back = normalizeCoordinate(pixel.x, pixel.y, containerWidth, containerHeight)
          return (
            Math.abs(back.x - rx) < 1e-9 &&
            Math.abs(back.y - ry) < 1e-9
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Property 1: 目印座標の正規化
 * Validates: Requirements 8-3.1
 *
 * 任意の参照画像表示サイズ（width, height）と任意のクリック座標（x, y）に対して、
 * 正規化後の相対座標は必ず [0.0, 1.0] の範囲内に収まる。
 */
describe('Property 1: 目印座標の正規化 (Validates: Requirements 8-3.1)', () => {
  it('任意のコンテナサイズとクリック座標に対して正規化後の座標が [0.0, 1.0] の範囲内に収まる', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 10000, noNaN: true }),   // containerWidth
        fc.float({ min: 1, max: 10000, noNaN: true }),   // containerHeight
        fc.float({ min: 0, max: 10000, noNaN: true }),   // pixelX (within container bounds)
        fc.float({ min: 0, max: 10000, noNaN: true }),   // pixelY (within container bounds)
        (containerWidth, containerHeight, pixelX, pixelY) => {
          // クリック座標をコンテナ内に収める
          const clampedX = Math.min(pixelX, containerWidth)
          const clampedY = Math.min(pixelY, containerHeight)
          const result = normalizeCoordinate(clampedX, clampedY, containerWidth, containerHeight)
          return (
            result.x >= 0.0 && result.x <= 1.0 &&
            result.y >= 0.0 && result.y <= 1.0
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})

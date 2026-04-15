/**
 * クリック座標（ピクセル）を相対座標（0.0〜1.0）に変換する
 * @param pixelX - コンテナ内のX座標（ピクセル）
 * @param pixelY - コンテナ内のY座標（ピクセル）
 * @param containerWidth - コンテナの幅（ピクセル）
 * @param containerHeight - コンテナの高さ（ピクセル）
 * @returns 相対座標 { x, y }（0.0〜1.0）
 */
export function normalizeCoordinate(
  pixelX: number,
  pixelY: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  return {
    x: Math.min(1, Math.max(0, pixelX / containerWidth)),
    y: Math.min(1, Math.max(0, pixelY / containerHeight)),
  }
}

/**
 * 相対座標（0.0〜1.0）をピクセル座標に変換する
 * @param relX - 相対X座標（0.0〜1.0）
 * @param relY - 相対Y座標（0.0〜1.0）
 * @param containerWidth - コンテナの幅（ピクセル）
 * @param containerHeight - コンテナの高さ（ピクセル）
 * @returns ピクセル座標 { x, y }
 */
export function toPixelCoordinate(
  relX: number,
  relY: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } {
  return {
    x: relX * containerWidth,
    y: relY * containerHeight,
  }
}

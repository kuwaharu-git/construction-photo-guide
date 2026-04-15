import { describe, it } from 'vitest'
import * as fc from 'fast-check'

import type { Marker } from '../types'

/**
 * addMarker の純粋ロジックを抽出した関数
 * AppContext.tsx の addMarker と同等の処理を純粋関数として表現する
 */
function addMarkerPure(markers: Marker[], x: number, y: number, id: string): Marker[] {
  const marker: Marker = { id, x, y }
  return [...markers, marker]
}

/**
 * Property 3: 目印追加の不変条件
 * **Validates: Requirements F-02**
 *
 * 任意の目印リストに対して、有効な相対座標で追加した後に
 * - リスト長が1増加する
 * - 追加した目印（x, y 座標）がリストに含まれる
 */
describe('Property 3: 目印追加の不変条件 (Validates: Requirements F-02)', () => {
  it('任意の目印リストに有効な相対座標で追加するとリスト長が1増加し追加した目印が含まれる', () => {
    const markerArb = fc.record({
      id: fc.uuid(),
      x: fc.float({ min: 0, max: 1, noNaN: true }),
      y: fc.float({ min: 0, max: 1, noNaN: true }),
    })

    fc.assert(
      fc.property(
        fc.array(markerArb),                              // 任意の目印リスト
        fc.float({ min: 0, max: 1, noNaN: true }),        // 追加するX座標 (0.0〜1.0)
        fc.float({ min: 0, max: 1, noNaN: true }),        // 追加するY座標 (0.0〜1.0)
        fc.uuid(),                                        // 新しい目印のID
        (existingMarkers, x, y, newId) => {
          const before = existingMarkers.length
          const result = addMarkerPure(existingMarkers, x, y, newId)

          // リスト長が1増加していること
          const lengthIncreased = result.length === before + 1

          // 追加した目印がリストに含まれること（x, y 座標で確認）
          const markerPresent = result.some((m) => m.x === x && m.y === y && m.id === newId)

          return lengthIncreased && markerPresent
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * removeMarker の純粋ロジックを抽出した関数
 * AppContext.tsx の removeMarker と同等の処理を純粋関数として表現する
 */
function removeMarkerPure(markers: Marker[], id: string): Marker[] {
  return markers.filter((m) => m.id !== id)
}

/**
 * Property 4: 目印削除の不変条件
 * **Validates: Requirements F-03**
 *
 * 任意の目印リストに対して、存在するIDで削除した後に
 * - リスト長が1減少する
 * - 削除した目印がリストに含まれない
 */
describe('Property 4: 目印削除の不変条件 (Validates: Requirements F-03)', () => {
  it('任意の目印リストから存在するIDで削除するとリスト長が1減少し削除した目印が含まれない', () => {
    const markerArb = fc.record({
      id: fc.uuid(),
      x: fc.float({ min: 0, max: 1, noNaN: true }),
      y: fc.float({ min: 0, max: 1, noNaN: true }),
    })

    fc.assert(
      fc.property(
        fc.array(markerArb),  // 任意の目印リスト（0個以上）
        markerArb,            // 削除対象の目印
        (existingMarkers, targetMarker) => {
          // 削除対象をリストに確実に含める（重複IDがある場合は除外して追加）
          const markersWithTarget = [
            ...existingMarkers.filter((m) => m.id !== targetMarker.id),
            targetMarker,
          ]
          const before = markersWithTarget.length

          const result = removeMarkerPure(markersWithTarget, targetMarker.id)

          // リスト長が1減少していること
          const lengthDecreased = result.length === before - 1

          // 削除した目印がリストに含まれないこと
          const markerAbsent = !result.some((m) => m.id === targetMarker.id)

          return lengthDecreased && markerAbsent
        }
      ),
      { numRuns: 100 }
    )
  })
})

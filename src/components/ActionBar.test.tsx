import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ActionBar } from './ActionBar'

describe('ActionBar', () => {
  const defaultProps = {
    hasImage: false,
    showMarkers: true,
    onToggleMarkers: vi.fn(),
    onStartCamera: vi.fn(),
  }

  it('参照画像未選択時に撮影開始ボタンが disabled になること (F-05)', () => {
    render(<ActionBar {...defaultProps} hasImage={false} />)
    const startButton = screen.getByRole('button', { name: '撮影開始' })
    expect(startButton).toBeDisabled()
  })

  it('参照画像選択済み時に撮影開始ボタンが有効になること', () => {
    render(<ActionBar {...defaultProps} hasImage={true} />)
    const startButton = screen.getByRole('button', { name: '撮影開始' })
    expect(startButton).not.toBeDisabled()
  })

  it('目印トグルボタンが showMarkers の状態を反映すること', () => {
    render(<ActionBar {...defaultProps} showMarkers={true} />)
    const toggleButton = screen.getByRole('button', { name: /目印/ })
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('目印トグルボタンが showMarkers=false の状態を反映すること', () => {
    render(<ActionBar {...defaultProps} showMarkers={false} />)
    const toggleButton = screen.getByRole('button', { name: /目印/ })
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
  })
})

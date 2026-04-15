import React from 'react'

interface ShutterButtonProps {
  onShutter: () => void
  disabled: boolean
}

const ShutterButton: React.FC<ShutterButtonProps> = ({ onShutter, disabled }) => {
  return (
    <button
      onClick={onShutter}
      disabled={disabled}
      aria-label="撮影"
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        border: '4px solid white',
        backgroundColor: 'white',
        boxShadow: '0 0 0 3px rgba(255,255,255,0.5)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    />
  )
}

export default ShutterButton

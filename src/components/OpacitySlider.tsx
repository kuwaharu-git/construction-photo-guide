import React from 'react';

interface OpacitySliderProps {
  value: number; // 0.0 to 1.0
  onChange: (value: number) => void;
}

const OpacitySlider: React.FC<OpacitySliderProps> = ({ value, onChange }) => {
  const percentage = Math.round(value * 100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value) / 100);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label htmlFor="opacity-slider" style={{ whiteSpace: 'nowrap', fontSize: '14px' }}>
        透明度
      </label>
      <input
        id="opacity-slider"
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={handleChange}
        style={{ flex: 1, minHeight: '44px', cursor: 'pointer' }}
        aria-label="透明度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={`${percentage}%`}
      />
      <span style={{ minWidth: '40px', textAlign: 'right', fontSize: '14px' }}>
        {percentage}%
      </span>
    </div>
  );
};

export default OpacitySlider;

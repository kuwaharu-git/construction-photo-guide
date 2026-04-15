import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OpacitySlider from './OpacitySlider';

describe('OpacitySlider', () => {
  it('displays the current value as a percentage label', () => {
    render(<OpacitySlider value={0.5} onChange={() => {}} />);
    expect(screen.getByText('50%')).toBeTruthy();
  });

  it('displays 0% when value is 0.0', () => {
    render(<OpacitySlider value={0} onChange={() => {}} />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('displays 100% when value is 1.0', () => {
    render(<OpacitySlider value={1} onChange={() => {}} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('calls onChange with value divided by 100', () => {
    const onChange = vi.fn();
    render(<OpacitySlider value={0.5} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '75' } });
    expect(onChange).toHaveBeenCalledWith(0.75);
  });

  it('calls onChange with 0.0 when slider is set to 0', () => {
    const onChange = vi.fn();
    render(<OpacitySlider value={0.5} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0' } });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('calls onChange with 1.0 when slider is set to 100', () => {
    const onChange = vi.fn();
    render(<OpacitySlider value={0.5} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '100' } });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('renders the 透明度 label', () => {
    render(<OpacitySlider value={0.3} onChange={() => {}} />);
    expect(screen.getByText('透明度')).toBeTruthy();
  });

  it('slider has min=0 and max=100', () => {
    render(<OpacitySlider value={0.5} onChange={() => {}} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveProperty('min', '0');
    expect(slider).toHaveProperty('max', '100');
  });
});

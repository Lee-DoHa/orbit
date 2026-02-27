import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IntensitySlider } from '@/components/emotion/IntensitySlider';

describe('IntensitySlider', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders 5 intensity levels', () => {
    const { getByText } = render(
      <IntensitySlider value={3} onChange={mockOnChange} />
    );

    for (let i = 1; i <= 5; i++) {
      expect(getByText(String(i))).toBeTruthy();
    }
  });

  it('renders labels', () => {
    const { getByText } = render(
      <IntensitySlider value={3} onChange={mockOnChange} />
    );

    expect(getByText('낮음')).toBeTruthy();
    expect(getByText('높음')).toBeTruthy();
  });

  it('calls onChange when a level is pressed', () => {
    const { getByText } = render(
      <IntensitySlider value={3} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('5'));
    expect(mockOnChange).toHaveBeenCalledWith(5);
  });

  it('calls onChange with level 1', () => {
    const { getByText } = render(
      <IntensitySlider value={3} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('1'));
    expect(mockOnChange).toHaveBeenCalledWith(1);
  });
});

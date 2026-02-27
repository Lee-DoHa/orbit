import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmotionChipGroup } from '@/components/emotion/EmotionChipGroup';
import { EMOTIONS } from '@/lib/constants';
import type { EmotionId } from '@/lib/constants';

describe('EmotionChipGroup', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  it('renders all 10 emotion chips', () => {
    const { getAllByText } = render(
      <EmotionChipGroup selected={[]} onToggle={mockOnToggle} />
    );

    EMOTIONS.forEach((emotion) => {
      expect(getAllByText(emotion.name).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('calls onToggle when chip is pressed', () => {
    const { getByText } = render(
      <EmotionChipGroup selected={[]} onToggle={mockOnToggle} />
    );

    fireEvent.press(getByText('긴장'));
    expect(mockOnToggle).toHaveBeenCalledWith(1);
  });

  it('does not call onToggle for disabled chips when 3 already selected', () => {
    const selected = [1, 2, 3] as EmotionId[];
    const { getByText } = render(
      <EmotionChipGroup selected={selected} onToggle={mockOnToggle} />
    );

    fireEvent.press(getByText('안정'));
    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('allows toggling off a selected chip even when max reached', () => {
    const selected = [1, 2, 3] as EmotionId[];
    const { getByText } = render(
      <EmotionChipGroup selected={selected} onToggle={mockOnToggle} />
    );

    fireEvent.press(getByText('긴장'));
    expect(mockOnToggle).toHaveBeenCalledWith(1);
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ContextTagSelector } from '@/components/emotion/ContextTagSelector';
import { CONTEXTS } from '@/lib/constants';

describe('ContextTagSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders all 6 context tags', () => {
    const { getByText } = render(
      <ContextTagSelector selected={null} onSelect={mockOnSelect} />
    );

    CONTEXTS.forEach((ctx) => {
      expect(getByText(ctx.name)).toBeTruthy();
    });
  });

  it('calls onSelect when tag is pressed', () => {
    const { getByText } = render(
      <ContextTagSelector selected={null} onSelect={mockOnSelect} />
    );

    fireEvent.press(getByText('업무'));
    expect(mockOnSelect).toHaveBeenCalledWith('work');
  });

  it('calls onSelect for 건강 tag', () => {
    const { getByText } = render(
      <ContextTagSelector selected={null} onSelect={mockOnSelect} />
    );

    fireEvent.press(getByText('건강'));
    expect(mockOnSelect).toHaveBeenCalledWith('health');
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CosmicButton } from '@/components/ui/CosmicButton';

describe('CosmicButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders button title', () => {
    const { getByText } = render(
      <CosmicButton title="감정 구조화하기" onPress={mockOnPress} />
    );

    expect(getByText('감정 구조화하기')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <CosmicButton title="시작" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('시작'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByText } = render(
      <CosmicButton title="비활성" onPress={mockOnPress} disabled />
    );

    fireEvent.press(getByText('비활성'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const { getByText, rerender } = render(
      <CosmicButton title="Primary" onPress={mockOnPress} variant="primary" />
    );
    expect(getByText('Primary')).toBeTruthy();

    rerender(
      <CosmicButton title="Secondary" onPress={mockOnPress} variant="secondary" />
    );
    expect(getByText('Secondary')).toBeTruthy();

    rerender(
      <CosmicButton title="Ghost" onPress={mockOnPress} variant="ghost" />
    );
    expect(getByText('Ghost')).toBeTruthy();
  });
});

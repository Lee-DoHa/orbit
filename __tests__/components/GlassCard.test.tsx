import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { GlassCard } from '@/components/ui/GlassCard';

describe('GlassCard', () => {
  it('renders children', () => {
    const { getByText } = render(
      <GlassCard>
        <Text>테스트 내용</Text>
      </GlassCard>
    );

    expect(getByText('테스트 내용')).toBeTruthy();
  });

  it('renders with highlight variant', () => {
    const { getByText } = render(
      <GlassCard variant="highlight">
        <Text>하이라이트</Text>
      </GlassCard>
    );

    expect(getByText('하이라이트')).toBeTruthy();
  });

  it('renders with default variant by default', () => {
    const { getByText } = render(
      <GlassCard>
        <Text>기본</Text>
      </GlassCard>
    );

    expect(getByText('기본')).toBeTruthy();
  });
});

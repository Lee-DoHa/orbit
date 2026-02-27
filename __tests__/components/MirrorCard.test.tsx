import React from 'react';
import { render } from '@testing-library/react-native';
import { MirrorCard } from '@/components/mirror/MirrorCard';

describe('MirrorCard', () => {
  const baseData = {
    understanding: '당신은 업무 긴장을 느끼고 있네요.',
    structure: '이 감정은 높은 기대치에서 비롯된 것 같습니다.',
    suggestion: '5분 호흡 운동을 시도해보세요.',
  };

  it('renders header text', () => {
    const { getByText } = render(<MirrorCard data={baseData} />);
    expect(getByText('오늘의 거울')).toBeTruthy();
  });

  it('renders all 3 sections', () => {
    const { getByText } = render(<MirrorCard data={baseData} />);

    expect(getByText('이해')).toBeTruthy();
    expect(getByText('구조')).toBeTruthy();
    expect(getByText('제안')).toBeTruthy();
  });

  it('renders section content', () => {
    const { getByText } = render(<MirrorCard data={baseData} />);

    expect(getByText(baseData.understanding)).toBeTruthy();
    expect(getByText(baseData.structure)).toBeTruthy();
    expect(getByText(baseData.suggestion)).toBeTruthy();
  });

  it('renders section numbers', () => {
    const { getByText } = render(<MirrorCard data={baseData} />);

    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
  });

  it('renders question section when provided', () => {
    const data = { ...baseData, question: '오늘 가장 걱정되는 것은 무엇인가요?' };
    const { getByText } = render(<MirrorCard data={data} />);

    expect(getByText('성찰 질문')).toBeTruthy();
    expect(getByText('오늘 가장 걱정되는 것은 무엇인가요?')).toBeTruthy();
  });

  it('does not render question section when null', () => {
    const data = { ...baseData, question: null };
    const { queryByText } = render(<MirrorCard data={data} />);

    expect(queryByText('성찰 질문')).toBeNull();
  });

  it('does not render question section when absent', () => {
    const { queryByText } = render(<MirrorCard data={baseData} />);
    expect(queryByText('성찰 질문')).toBeNull();
  });
});

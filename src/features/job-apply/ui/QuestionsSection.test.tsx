import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ApplicationQuestion } from '@/entities/job-application';

import { QuestionsSection } from './QuestionsSection';

const TEXT_QUESTION: ApplicationQuestion = {
  fieldId: 'q-text',
  type: 'TEXT',
  title: '지원 동기',
  description: null,
  required: true,
  order: 1,
  options: null,
};

const TEXTAREA_QUESTION: ApplicationQuestion = {
  fieldId: 'q-textarea',
  type: 'TEXTAREA',
  title: '기술 경험',
  description: '자유롭게 작성해 주세요.',
  required: false,
  order: 2,
  options: null,
};

const SINGLE_SELECT_QUESTION: ApplicationQuestion = {
  fieldId: 'q-single',
  type: 'SINGLE_SELECT',
  title: '희망 직무',
  description: null,
  required: true,
  order: 3,
  options: ['프론트엔드', '백엔드'],
};

const MULTI_SELECT_QUESTION: ApplicationQuestion = {
  fieldId: 'q-multi',
  type: 'MULTI_SELECT',
  title: '보유 기술',
  description: null,
  required: false,
  order: 4,
  options: ['React', 'Vue', 'Spring'],
};

describe('QuestionsSection', () => {
  it('문항이 없으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <QuestionsSection questions={[]} values={{}} onValueChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('order 순서대로 정렬해 "문항 N" 라벨과 제목·설명을 표시한다', () => {
    render(
      <QuestionsSection
        questions={[TEXTAREA_QUESTION, TEXT_QUESTION]}
        values={{}}
        onValueChange={vi.fn()}
      />,
    );

    const labels = screen.getAllByText(/^문항 \d$/);
    expect(labels[0]).toHaveTextContent('문항 1');
    expect(screen.getByText('지원 동기')).toBeInTheDocument();
    expect(screen.getByText('기술 경험')).toBeInTheDocument();
    expect(screen.getByText('자유롭게 작성해 주세요.')).toBeInTheDocument();
  });

  it('TEXT 문항은 입력값 변경 시 onValueChange를 호출한다', () => {
    const onValueChange = vi.fn();
    render(
      <QuestionsSection questions={[TEXT_QUESTION]} values={{}} onValueChange={onValueChange} />,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '성장하고 싶습니다' } });

    expect(onValueChange).toHaveBeenCalledWith('q-text', '성장하고 싶습니다');
  });

  it('SINGLE_SELECT 문항은 옵션을 라디오로 보여주고 선택 시 그 옵션 값을 넘긴다', () => {
    const onValueChange = vi.fn();
    render(
      <QuestionsSection
        questions={[SINGLE_SELECT_QUESTION]}
        values={{}}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '백엔드' }));

    expect(onValueChange).toHaveBeenCalledWith('q-single', '백엔드');
  });

  it('MULTI_SELECT 문항은 체크박스로 여러 옵션을 선택·해제할 수 있다', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <QuestionsSection
        questions={[MULTI_SELECT_QUESTION]}
        values={{}}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'React' }));
    expect(onValueChange).toHaveBeenLastCalledWith('q-multi', ['React']);

    rerender(
      <QuestionsSection
        questions={[MULTI_SELECT_QUESTION]}
        values={{ 'q-multi': ['React', 'Vue'] }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'React' }));
    expect(onValueChange).toHaveBeenLastCalledWith('q-multi', ['Vue']);
  });

  it('errorFieldIds에 있는 문항의 입력란에는 오류 테두리 색이 적용된다', () => {
    render(
      <QuestionsSection
        questions={[TEXT_QUESTION]}
        values={{}}
        onValueChange={vi.fn()}
        errorFieldIds={new Set(['q-text'])}
      />,
    );

    expect(screen.getByRole('textbox')).toHaveClass('border-[#ef4444]');
  });
});

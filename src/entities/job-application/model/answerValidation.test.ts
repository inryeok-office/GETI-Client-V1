import { describe, expect, it } from 'vitest';

import { isNonFileAnswerEmpty } from './answerValidation';
import type { ApplicationQuestion } from './types';

function question(overrides: Partial<ApplicationQuestion> = {}): ApplicationQuestion {
  return {
    fieldId: 'q1',
    type: 'TEXT',
    title: '질문',
    description: null,
    required: true,
    order: 1,
    options: null,
    ...overrides,
  };
}

describe('isNonFileAnswerEmpty', () => {
  it('TEXT/TEXTAREA/SINGLE_SELECT는 빈 문자열이거나 공백만 있으면 비어 있다고 본다', () => {
    expect(isNonFileAnswerEmpty(question({ type: 'TEXT' }), undefined)).toBe(true);
    expect(isNonFileAnswerEmpty(question({ type: 'TEXT' }), '   ')).toBe(true);
    expect(isNonFileAnswerEmpty(question({ type: 'TEXT' }), '답변')).toBe(false);
    expect(isNonFileAnswerEmpty(question({ type: 'SINGLE_SELECT' }), '옵션 A')).toBe(false);
  });

  it('MULTI_SELECT는 배열이 비어 있거나 배열이 아니면 비어 있다고 본다', () => {
    expect(isNonFileAnswerEmpty(question({ type: 'MULTI_SELECT' }), undefined)).toBe(true);
    expect(isNonFileAnswerEmpty(question({ type: 'MULTI_SELECT' }), [])).toBe(true);
    expect(isNonFileAnswerEmpty(question({ type: 'MULTI_SELECT' }), ['옵션 A'])).toBe(false);
  });

  it('FILE 타입은 항상 false를 반환한다(fileIds 개수는 별도로 판단해야 한다)', () => {
    expect(isNonFileAnswerEmpty(question({ type: 'FILE' }), undefined)).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import {
  formatOperationJobDateTime,
  getOperationJobActionStatusLabel,
  getOperationJobStatusPresentation,
} from './operationJobPresentation';

describe('getOperationJobStatusPresentation', () => {
  it.each([
    ['PARTIAL_SUCCESS', { label: '일부 실패', tone: 'error' }],
    ['SENDING', { label: '전송 중', tone: 'neutral' }],
    ['DELIVERED', { label: '성공', tone: 'success' }],
    ['CUSTOM_STATUS', { label: 'CUSTOM_STATUS', tone: 'neutral' }],
  ])('%s 상태의 라벨과 톤을 반환한다', (status, expected) => {
    expect(getOperationJobStatusPresentation(status)).toEqual(expected);
  });
});

describe('getOperationJobActionStatusLabel', () => {
  it('API가 제공한 수동 실행 지원 여부를 한글 라벨로 반환한다', () => {
    expect(getOperationJobActionStatusLabel('SUPPORTED')).toBe('지원됨');
    expect(getOperationJobActionStatusLabel('UNSUPPORTED')).toBe('미지원');
  });
});

describe('formatOperationJobDateTime', () => {
  it('ISO 일시를 타임존 변환 없이 분 단위로 표시한다', () => {
    expect(formatOperationJobDateTime('2026-09-02T03:05:30')).toBe('2026.09.02 03:05');
  });

  it('값이 없으면 하이픈을 반환한다', () => {
    expect(formatOperationJobDateTime(null)).toBe('-');
  });

  it('알 수 없는 형식은 원본을 반환한다', () => {
    expect(formatOperationJobDateTime('unknown')).toBe('unknown');
  });
});

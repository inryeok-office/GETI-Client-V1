import type { ApplicationQuestion } from './types';

/**
 * 문항 답변이 비어 있는지 판단한다. FILE 타입은 값이 아니라 업로드된 `fileIds` 개수로 판단해야
 * 해서(`AttachmentUploadSection` 쪽 상태) 여기서 다루지 않는다 — FILE 문항을 넘기면 항상 false를
 * 반환한다.
 */
export function isNonFileAnswerEmpty(
  question: ApplicationQuestion,
  value: string | string[] | undefined,
): boolean {
  if (question.type === 'FILE') return false;
  if (question.type === 'MULTI_SELECT') return !Array.isArray(value) || value.length === 0;
  return typeof value !== 'string' || value.trim() === '';
}

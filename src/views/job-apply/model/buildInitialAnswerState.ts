import { type ApplicationAttachment, type JobApplicationDraft } from '@/entities/job-application';
import type { QuestionAnswerValue } from '@/features/job-apply';
import { formatFileSize } from '@/shared/lib';

export interface InitialAnswerState {
  values: Record<string, QuestionAnswerValue>;
  attachmentsByFieldId: Record<string, ApplicationAttachment[]>;
}

/**
 * 초안 생성 · 임시저장 응답의 `answers`(fieldId + value/fileIds)를 화면이 다루는 형태로 바꾼다.
 * FILE 타입 문항의 `fileIds`는 실제 파일 이름 · 크기를 보여줘야 해서 `files`(fileId별 메타데이터
 * 목록)와 대조해 `ApplicationAttachment`로 만든다. `questions`에 없는 fieldId(있을 수 없지만 응답이
 * 어긋난 경우)는 조용히 건너뛴다.
 */
export function buildInitialAnswerState(draft: JobApplicationDraft): InitialAnswerState {
  const values: Record<string, QuestionAnswerValue> = {};
  const attachmentsByFieldId: Record<string, ApplicationAttachment[]> = {};
  const fileById = new Map(draft.files.map((file) => [file.fileId, file]));

  for (const answer of draft.answers) {
    const question = draft.questions.find((item) => item.fieldId === answer.fieldId);
    if (!question) continue;

    if (question.type === 'FILE') {
      attachmentsByFieldId[answer.fieldId] = (answer.fileIds ?? [])
        .map((fileId) => fileById.get(fileId))
        .filter((file) => file !== undefined)
        .map((file) => ({
          id: `file-${file.fileId}`,
          fileName: file.originalName,
          fileSize: formatFileSize(file.size),
          uploadError: null,
          fileId: file.fileId,
        }));
      continue;
    }

    if (question.type === 'MULTI_SELECT') {
      values[answer.fieldId] = Array.isArray(answer.value) ? (answer.value as string[]) : [];
      continue;
    }

    if (typeof answer.value === 'string') values[answer.fieldId] = answer.value;
  }

  return { values, attachmentsByFieldId };
}

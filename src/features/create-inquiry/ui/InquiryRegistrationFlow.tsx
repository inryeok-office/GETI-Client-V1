'use client';

import { useCallback, useState, type FormEvent, type ReactNode } from 'react';

import { useCreateInquiryMutation, type InquiryType } from '@/entities/inquiry';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { TextareaField } from '@/shared/ui/textarea-field';
import { TextField } from '@/shared/ui/text-field';

import {
  InquiryRegistrationBanner,
  type InquiryRegistrationFeedback,
} from './InquiryRegistrationBanner';
import { InquiryTypeSelect, type InquiryTypeOption } from './InquiryTypeSelect';

interface InquiryRegistrationFlowProps {
  children: ReactNode;
  list: ReactNode;
  onRegistrationSuccess?: () => void;
}

interface InquiryFormErrors {
  content?: string;
  inquiryType?: string;
  title?: string;
}

const INQUIRY_TYPE_OPTIONS: readonly InquiryTypeOption[] = [
  { label: '오류', value: 'ERROR' },
  { label: '불편사항', value: 'INCONVENIENCE' },
  { label: '기능 요청', value: 'FEATURE_REQUEST' },
  { label: '기타', value: 'ETC' },
];

const MAX_INQUIRY_TITLE_LENGTH = 500;

export function InquiryRegistrationFlow({
  children,
  list,
  onRegistrationSuccess,
}: InquiryRegistrationFlowProps) {
  const createInquiryMutation = useCreateInquiryMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<InquiryRegistrationFeedback | null>(null);
  const [inquiryType, setInquiryType] = useState<InquiryType | ''>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<InquiryFormErrors>({});

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setErrors({});
  }, []);

  const resetForm = () => {
    setInquiryType('');
    setTitle('');
    setContent('');
    setErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: InquiryFormErrors = {
      inquiryType: inquiryType ? undefined : '문의 유형을 선택해 주세요.',
      title: !title.trim()
        ? '제목을 입력해 주세요.'
        : title.trim().length > MAX_INQUIRY_TITLE_LENGTH
          ? '제목은 500자 이하로 입력해 주세요.'
          : undefined,
      content: content.trim() ? undefined : '문의 내용을 입력해 주세요.',
    };

    setErrors(nextErrors);
    if (!inquiryType || Object.values(nextErrors).some(Boolean)) return;

    try {
      await createInquiryMutation.mutateAsync({
        inquiryType,
        title: title.trim(),
        content: content.trim(),
      });
      setFeedback('success');
      resetForm();
      onRegistrationSuccess?.();
    } catch {
      setFeedback('error');
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        {children}
        <Button onClick={() => setIsOpen(true)}>문의 등록</Button>
      </div>

      <div className="mt-[32px] flex flex-col gap-[16px]">
        {feedback ? (
          <InquiryRegistrationBanner feedback={feedback} onClose={() => setFeedback(null)} />
        ) : null}
        {list}
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={closeDialog}
        title="문의 등록"
        panelClassName="w-full max-w-[600px] rounded-[16px] bg-white p-[40px] shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)]"
        titleClassName="border-b border-[#e5e5e5] pb-[32px] text-[24px] leading-[1.4] font-semibold tracking-[-0.24px] text-[#111]"
        contentClassName="mt-[40px]"
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-[40px]">
            <div className="flex flex-col gap-[8px]">
              <label
                htmlFor="inquiry-type"
                className="px-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#17262e]"
              >
                문의 유형
              </label>
              <InquiryTypeSelect
                id="inquiry-type"
                value={inquiryType}
                disabled={createInquiryMutation.isPending}
                errorMessage={errors.inquiryType}
                onChange={setInquiryType}
                options={INQUIRY_TYPE_OPTIONS}
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label
                htmlFor="inquiry-title"
                className="px-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]"
              >
                제목
              </label>
              <TextField
                id="inquiry-title"
                value={title}
                maxLength={MAX_INQUIRY_TITLE_LENGTH}
                disabled={createInquiryMutation.isPending}
                errorMessage={errors.title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-[56px] px-[16px]"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label
                htmlFor="inquiry-content"
                className="px-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]"
              >
                문의 내용
              </label>
              <TextareaField
                id="inquiry-content"
                value={content}
                disabled={createInquiryMutation.isPending}
                errorMessage={errors.content}
                onChange={(event) => setContent(event.target.value)}
                className="h-[168px] px-[16px] py-[16px]"
              />
            </div>
          </div>

          <div className="mt-[40px] flex justify-end gap-[8px]">
            <Button
              type="button"
              variant="neutral"
              disabled={createInquiryMutation.isPending}
              onClick={closeDialog}
            >
              취소
            </Button>
            <Button type="submit" isLoading={createInquiryMutation.isPending}>
              등록
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

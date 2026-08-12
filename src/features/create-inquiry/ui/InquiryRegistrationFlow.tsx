'use client';

import { useCallback, useState, type FormEvent, type ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { TextareaField } from '@/shared/ui/textarea-field';
import { TextField } from '@/shared/ui/text-field';

import {
  InquiryRegistrationBanner,
  type InquiryRegistrationFeedback,
} from './InquiryRegistrationBanner';
import { InquiryTypeSelect } from './InquiryTypeSelect';

export type MockInquirySubmitResult = 'success' | 'error';

interface InquiryRegistrationFlowProps {
  children: ReactNode;
  initialFeedback?: InquiryRegistrationFeedback | null;
  list: ReactNode;
  mockSubmitResult?: MockInquirySubmitResult;
}

interface InquiryFormErrors {
  content?: string;
  inquiryType?: string;
  title?: string;
}

const MOCK_INQUIRY_TYPES = ['서비스 이용', '지원 문의', '계정·프로필', '공고 문의'];

export function InquiryRegistrationFlow({
  children,
  initialFeedback = null,
  list,
  mockSubmitResult = 'success',
}: InquiryRegistrationFlowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<InquiryRegistrationFeedback | null>(initialFeedback);
  const [inquiryType, setInquiryType] = useState('');
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
      title: title.trim() ? undefined : '제목을 입력해 주세요.',
      content: content.trim() ? undefined : '문의 내용을 입력해 주세요.',
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsSubmitting(false);
    setIsOpen(false);
    setFeedback(mockSubmitResult);
    resetForm();
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
                disabled={isSubmitting}
                errorMessage={errors.inquiryType}
                onChange={setInquiryType}
                options={MOCK_INQUIRY_TYPES}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                errorMessage={errors.content}
                onChange={(event) => setContent(event.target.value)}
                className="h-[168px] px-[16px] py-[16px]"
              />
            </div>
          </div>

          <div className="mt-[40px] flex justify-end gap-[8px]">
            <Button variant="neutral" disabled={isSubmitting} onClick={closeDialog}>
              취소
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              등록
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

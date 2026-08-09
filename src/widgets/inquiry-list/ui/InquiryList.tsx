import { InquiryCard, type InquiryListItem } from '@/entities/inquiry';

import { InquiryListEmpty } from './InquiryListEmpty';
import { InquiryListError } from './InquiryListError';
import { InquiryListSkeleton } from './InquiryListSkeleton';

export type InquiryListStatus = 'loading' | 'error' | 'empty' | 'success';

interface InquiryListProps {
  inquiries: InquiryListItem[];
  status: InquiryListStatus;
}

export function InquiryList({ inquiries, status }: InquiryListProps) {
  if (status === 'loading') return <InquiryListSkeleton />;
  if (status === 'error') return <InquiryListError />;
  if (status === 'empty') return <InquiryListEmpty />;

  return (
    <div className="flex flex-col gap-[16px]">
      {inquiries.map((inquiry) => (
        <InquiryCard key={inquiry.inquiryId} inquiry={inquiry} />
      ))}
    </div>
  );
}

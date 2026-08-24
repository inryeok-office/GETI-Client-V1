import { InquiryCard, type InquiryListItem } from '@/entities/inquiry';

import { InquiryListEmpty } from './InquiryListEmpty';
import { InquiryListError } from './InquiryListError';
import { InquiryPagination } from './InquiryPagination';
import { InquiryListSkeleton } from './InquiryListSkeleton';

export type InquiryListStatus = 'loading' | 'error' | 'empty' | 'success';

interface InquiryListProps {
  basePath: string;
  currentPage: number;
  inquiries: InquiryListItem[];
  onRetry: () => void;
  status: InquiryListStatus;
  totalPages: number;
}

export function InquiryList({
  basePath,
  currentPage,
  inquiries,
  onRetry,
  status,
  totalPages,
}: InquiryListProps) {
  if (status === 'loading') return <InquiryListSkeleton />;
  if (status === 'error') return <InquiryListError onRetry={onRetry} />;
  if (status === 'empty') return <InquiryListEmpty />;

  return (
    <div className="flex flex-col gap-[32px]">
      <div className="flex flex-col gap-[16px]">
        {inquiries.map((inquiry) => (
          <InquiryCard
            key={inquiry.inquiryId}
            inquiry={inquiry}
            detailHref={`${basePath}/${inquiry.inquiryId}${currentPage > 1 ? `?returnPage=${currentPage}` : ''}`}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <InquiryPagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
      ) : null}
    </div>
  );
}

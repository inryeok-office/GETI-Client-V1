'use client';

import { useState } from 'react';

import { JobCard, type JobListItem } from '@/entities/job';

import { BookmarkListEmpty } from './BookmarkListEmpty';
import { BookmarkListError } from './BookmarkListError';
import { BookmarkListSkeleton } from './BookmarkListSkeleton';
import { BookmarkRemovalError } from './BookmarkRemovalError';

export type BookmarkListStatus = 'empty' | 'error' | 'loading' | 'success';

interface BookmarkListProps {
  initialJobs: JobListItem[];
  initialRemovalErrorJobId?: string | null;
  mockRemovalResult?: 'error' | 'success';
  onRetry?: () => void;
  status: BookmarkListStatus;
}

export function BookmarkList({
  initialJobs,
  initialRemovalErrorJobId = null,
  mockRemovalResult = 'success',
  onRetry,
  status,
}: BookmarkListProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [removalErrorJobId, setRemovalErrorJobId] = useState(initialRemovalErrorJobId);
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleBookmarkChange = (job: JobListItem, isBookmarked: boolean) => {
    if (isBookmarked) return;

    if (mockRemovalResult === 'error') {
      setRemovalErrorJobId(job.id);
      return;
    }

    setRemovalErrorJobId(null);
    setJobs((currentJobs) => currentJobs.filter((currentJob) => currentJob.id !== job.id));
  };

  const handleRetry = () => {
    onRetry?.();
    setCurrentStatus('success');
  };

  const isEmpty = currentStatus === 'empty' || (currentStatus === 'success' && jobs.length === 0);
  const showCount = currentStatus === 'success' || currentStatus === 'empty';

  return (
    <div>
      {showCount ? (
        <p className="px-[4px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
          저장한 공고 <strong className="font-bold">{jobs.length}개</strong>
        </p>
      ) : null}

      <div className={showCount ? 'mt-[24px]' : ''}>
        {currentStatus === 'loading' ? <BookmarkListSkeleton /> : null}
        {currentStatus === 'error' ? <BookmarkListError onRetry={handleRetry} /> : null}
        {isEmpty ? <BookmarkListEmpty /> : null}
        {currentStatus === 'success' && !isEmpty ? (
          <div className="flex flex-col gap-[16px]">
            {jobs.map((job) => (
              <div key={job.id} className="relative">
                <JobCard job={job} onBookmarkChange={handleBookmarkChange} />
                {removalErrorJobId === job.id ? <BookmarkRemovalError /> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchJobApplicationDraft, findActiveJobApplicationDraft } from './jobApplicationApi';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('@/shared/api', () => ({ api: { get: mockGet } }));

beforeEach(() => {
  mockGet.mockReset();
});

describe('fetchJobApplicationDraft', () => {
  it('GET /job-applications/{id}로 본인 지원서 상세를 조회한다', async () => {
    const draft = { applicationId: 7, jobId: 3, status: 'DRAFT' };
    mockGet.mockResolvedValue({ data: { success: true, data: draft } });

    await expect(fetchJobApplicationDraft(7)).resolves.toBe(draft);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/job-applications/7');
  });
});

describe('findActiveJobApplicationDraft', () => {
  it('그 공고의 DRAFT를 찾아 상세를 반환한다', async () => {
    mockGet
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            content: [
              { applicationId: 10, job: { jobId: 1 } },
              { applicationId: 11, job: { jobId: 3 } },
            ],
          },
        },
      })
      .mockResolvedValueOnce({ data: { success: true, data: { applicationId: 11, jobId: 3 } } });

    const result = await findActiveJobApplicationDraft(3);

    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/v1/me/job-applications', {
      params: { status: 'DRAFT', page: 0, size: 100 },
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/v1/job-applications/11');
    expect(result).toEqual({ applicationId: 11, jobId: 3 });
  });

  it('그 공고의 DRAFT가 없으면 null을 반환하고 상세를 조회하지 않는다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { content: [{ applicationId: 10, job: { jobId: 1 } }] } },
    });

    await expect(findActiveJobApplicationDraft(3)).resolves.toBeNull();
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('공고 정보가 없는(삭제된) 항목은 건너뛴다', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { content: [{ applicationId: 10, job: null }] } },
    });

    await expect(findActiveJobApplicationDraft(3)).resolves.toBeNull();
  });
});

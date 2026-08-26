import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchMajorMetadata,
  fetchTechStackMetadata,
  replaceMyMajors,
  replaceMyTechStacks,
  updateMyProfile,
} from './profileSetupApi';

const { mockGet, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: {
    get: mockGet,
    patch: mockPatch,
  },
}));

beforeEach(() => {
  mockGet.mockReset();
  mockPatch.mockReset();
});

describe('profileSetupApi', () => {
  it('활성 전공 메타데이터를 요청 취소 신호와 함께 조회한다', async () => {
    const majors = [{ majorId: 1, name: '백엔드', active: true }];
    const signal = new AbortController().signal;
    mockGet.mockResolvedValue({ data: { success: true, data: { items: majors } } });

    await expect(fetchMajorMetadata(signal)).resolves.toBe(majors);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/metadata/majors', {
      params: { activeOnly: true },
      signal,
    });
  });

  it('기술 스택 메타데이터를 요청 취소 신호와 함께 조회한다', async () => {
    const techStacks = [{ techStackId: 10, name: 'React', category: 'FRONTEND' as const }];
    const signal = new AbortController().signal;
    mockGet.mockResolvedValue({ data: { success: true, data: { items: techStacks } } });

    await expect(fetchTechStackMetadata(signal)).resolves.toBe(techStacks);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/metadata/tech-stacks', { signal });
  });

  it('선택한 전공 ID 전체를 교체 요청으로 전달한다', async () => {
    mockPatch.mockResolvedValue({});

    await replaceMyMajors([1, 2]);

    expect(mockPatch).toHaveBeenCalledWith('/api/v1/me/majors', { majorIds: [1, 2] });
  });

  it('선택한 기술 스택 ID 전체를 교체 요청으로 전달한다', async () => {
    mockPatch.mockResolvedValue({});

    await replaceMyTechStacks([10, 11]);

    expect(mockPatch).toHaveBeenCalledWith('/api/v1/me/tech-stacks', {
      techStackIds: [10, 11],
    });
  });

  it('프로필 수정 요청을 그대로 전달한다', async () => {
    const request = {
      department: 'SMART_IOT' as const,
      desiredJob: 'UXUI 디자이너',
      phone: '010-1234-5678',
      profileImageFileId: 77,
    };
    mockPatch.mockResolvedValue({});

    await updateMyProfile(request);

    expect(mockPatch).toHaveBeenCalledWith('/api/v1/me/profile', request);
  });
});

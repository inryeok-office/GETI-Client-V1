import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchStudentList,
  fetchStudentMajorOptions,
  fetchStudentProfile,
  fetchStudentTechStackOptions,
} from './studentApi';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock('@/shared/api', () => ({ api: { get: mockGet } }));

beforeEach(() => {
  mockGet.mockReset();
});

describe('studentApi', () => {
  it('페이지 조건이 없으면 Swagger 기본값 page=0, size=20으로 검색한다', async () => {
    const responseData = {
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchStudentList({ name: '홍' })).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/members', {
      params: { name: '홍', page: 0, size: 20 },
      signal: undefined,
    });
  });

  it('학생 목록을 검색·필터·페이지 조건과 취소 신호로 조회한다', async () => {
    const responseData = {
      content: [],
      page: 1,
      size: 20,
      totalElements: 0,
      totalPages: 0,
      first: false,
      last: true,
    };
    const controller = new AbortController();
    const params = {
      name: '홍',
      academicStatus: 'ENROLLED' as const,
      cohort: 10,
      department: 'SMART_IOT' as const,
      majorId: 1,
      techStackId: 10,
      page: 1,
      size: 20,
    };
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchStudentList(params, controller.signal)).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/members', {
      params,
      signal: controller.signal,
    });
  });

  it('학생 ID와 취소 신호로 공개 프로필을 조회한다', async () => {
    const responseData = { memberId: 42, name: '홍길동' };
    const controller = new AbortController();
    mockGet.mockResolvedValue({ data: { success: true, data: responseData } });

    await expect(fetchStudentProfile(42, controller.signal)).resolves.toBe(responseData);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/members/42', {
      signal: controller.signal,
    });
  });

  it('학생 검색용 전공과 기술 스택 선택지를 조회한다', async () => {
    const majors = [{ majorId: 1, name: '웹 개발', active: true }];
    const techStacks = [{ techStackId: 10, name: 'React', category: 'FRONTEND' }];
    mockGet
      .mockResolvedValueOnce({ data: { success: true, data: { items: majors } } })
      .mockResolvedValueOnce({ data: { success: true, data: { items: techStacks } } });

    await expect(fetchStudentMajorOptions()).resolves.toBe(majors);
    await expect(fetchStudentTechStackOptions()).resolves.toBe(techStacks);
    expect(mockGet).toHaveBeenNthCalledWith(1, '/api/v1/metadata/majors', {
      params: { activeOnly: true },
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/v1/metadata/tech-stacks');
  });
});

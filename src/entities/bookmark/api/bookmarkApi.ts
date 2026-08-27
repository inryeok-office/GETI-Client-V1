import { api, type ApiResponse } from '@/shared/api';

import type {
  BookmarkListApiResponse,
  BookmarkMutationApiResponse,
  CreateBookmarkRequest,
  FetchBookmarkListParams,
} from '../model/types';

const BOOKMARK_LIST_PATH = '/api/v1/me/job-bookmarks';
const BOOKMARK_PATH = '/api/v1/me/bookmarks';

/** 로그인한 사용자가 북마크한 공고 목록을 조회한다. */
export async function fetchBookmarkList(
  params: FetchBookmarkListParams = {},
): Promise<BookmarkListApiResponse> {
  const { data } = await api.get<ApiResponse<BookmarkListApiResponse>>(BOOKMARK_LIST_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}

/** 공고를 북마크한다. 공고 목록/상세 등 다른 화면에서도 재사용할 수 있도록 API 함수까지 준비한다. */
export async function createBookmark(
  request: CreateBookmarkRequest,
): Promise<BookmarkMutationApiResponse> {
  const { data } = await api.post<ApiResponse<BookmarkMutationApiResponse>>(BOOKMARK_PATH, request);
  return data.data;
}

/** 로그인한 사용자의 공고 북마크를 해제한다. 성공 응답은 204라서 Body를 사용하지 않는다. */
export async function deleteBookmark(jobId: number): Promise<void> {
  await api.delete(`${BOOKMARK_PATH}/${jobId}`);
}

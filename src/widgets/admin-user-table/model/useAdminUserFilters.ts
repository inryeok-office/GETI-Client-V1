'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  hasActiveFilters,
  patchQueryString,
  readFilters,
  type AdminUserFilters,
  type AdminUserManagementSearchParams,
} from './adminUserSearchParams';

const SEARCH_DEBOUNCE_MS = 300;

type QueryPatch = Partial<Record<keyof AdminUserManagementSearchParams, string | null>>;

/**
 * 사용자 관리 화면의 검색·필터·페이지·선택 회원 상태. **URL(`useSearchParams`)이 유일한 source of
 * truth**라, 브라우저 뒤로/앞으로나 클라이언트 내비게이션으로 쿼리가 바뀌어도 화면이 그대로 따라간다.
 * 로컬 상태는 300ms 디바운스를 위한 검색어 입력 버퍼(`searchInput`) 하나뿐이다.
 */
export function useAdminUserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);

  const [searchInput, setSearchInput] = useState(filters.query);
  // 방금 우리가 만든 검색어 변경인지 표시해, URL→입력 동기화 effect가 되돌리지 않게 한다.
  const pendingSearchRef = useRef<string | null>(null);

  /** 지금 URL 위에 `patch`를 덮어써 이동한다. 클릭 핸들러는 렌더 시점 `params`가 곧 현재 URL이라 그대로 쓴다. */
  function pushPatch(patch: QueryPatch, params: URLSearchParams = searchParams) {
    const queryString = patchQueryString(params, patch);
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  // 디바운스: 입력이 멎고 committed 검색어와 다르면 URL에 반영하고 페이지를 0으로.
  useEffect(() => {
    if (searchInput === filters.query) return;
    const timer = setTimeout(() => {
      pendingSearchRef.current = searchInput;
      // 타임아웃이 늦게 실행돼 그 사이 필터가 바뀌었을 수 있으니, 캡처한 params가 아니라 지금 URL 위에 얹는다.
      pushPatch(
        { q: searchInput || null, page: null },
        new URLSearchParams(window.location.search),
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, filters.query]);

  // 뒤로/앞으로 등으로 URL 검색어가 바뀌면 입력 버퍼도 맞춘다(우리가 만든 변경이면 건너뜀).
  useEffect(() => {
    if (pendingSearchRef.current === filters.query) {
      pendingSearchRef.current = null;
      return;
    }
    setSearchInput(filters.query);
  }, [filters.query]);

  return {
    filters,
    searchInput,
    hasActiveFilters: hasActiveFilters(filters),
    changeSearch: (value: string) => setSearchInput(value),
    changeStatus: (value: string) => pushPatch({ status: value || null, page: null }),
    changeRole: (value: string) => pushPatch({ role: value || null, page: null }),
    changeDepartment: (value: string) => pushPatch({ department: value || null, page: null }),
    changeCohort: (value: number | null) =>
      pushPatch({ cohort: value ? String(value) : null, page: null }),
    goToPage: (page: number) => pushPatch({ page: page > 0 ? String(page + 1) : null }),
    selectMember: (memberId: number | null) =>
      pushPatch({ memberId: memberId ? String(memberId) : null }),
  };
}

/** `AdminUserFilters`를 노출하기 위한 재-export. */
export type { AdminUserFilters };

import { BookmarkListPage } from '@/views/bookmark-list';

interface BookmarksRouteProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BookmarksRoute({ searchParams }: BookmarksRouteProps) {
  const { page } = await searchParams;
  const parsedPage = Number(page);
  const initialPage = Number.isInteger(parsedPage) && parsedPage > 1 ? parsedPage - 1 : 0;

  return <BookmarkListPage initialPage={initialPage} />;
}

import { BookmarkListPage } from '@/views/bookmark-list';

interface BookmarksRouteProps {
  searchParams: Promise<{ variant?: string }>;
}

export default function BookmarksRoute({ searchParams }: BookmarksRouteProps) {
  return <BookmarkListPage searchParams={searchParams} />;
}
